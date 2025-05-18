use std::sync::Arc;
use std::io::{Error as IoError, ErrorKind};

use futures::StreamExt;
use opentelemetry::global;
use poem::middleware::OpenTelemetryMetrics;
use poem::web::Data;
use poem::{get, handler, listener::TcpListener, middleware::Cors, Route, Server};
use poem::{Body, EndpointExt, IntoResponse, Request, Response};
use reqwest::StatusCode;
use tracing::info;

use crate::middlewares::tracing::TraceId;
use crate::models::deployment::{Deployment, DeploymentFile, DeploymentFileEntry};
use crate::models::domain::Domain;
use crate::models::site::Site;
use crate::routes::error::HttpError;
use crate::state::State;

const HTML_CACHE_SIZE_LIMIT: u64 = 1024 * 1024 * 5; // 5MB threshold
const HTML_CACHE_FILE_EXTENSIONS: [&str; 6] = ["html", "htm", "json", "xml", "css", "svg"];

pub async fn serve(state: State) {
    info!("Serving Router");

    let app = Route::new()
        .at("*", get(resolve_http))
        .with(Cors::new())
        .with(TraceId::new(Arc::new(global::tracer("edgeserver"))))
        .with(OpenTelemetryMetrics::new())
        .data(state);

    let listener = TcpListener::bind("0.0.0.0:3001");

    Server::new(listener).run(app).await.unwrap()
}

/// Attempt an SPA fallback by serving `index.html` from the same deployment.
async fn spa_fallback(deployment_id: &str, state: &State) -> Response {
    let spa_key = format!("{}:index.html", deployment_id);
    let deployment_str = deployment_id.to_string();
    let spa_entry: Option<DeploymentFileEntry> = state
        .cache
        .file_entry
        .get_with(spa_key.clone(), async move {
            DeploymentFile::get_file_by_path(&state.database, &deployment_str, "index.html").await.ok()
        })
        .await;
    if let Some(entry) = spa_entry {
        return serve_deployment_file(entry, state).await;
    }
    // default 404
    info!("SPA fallback failed for deployment {}", deployment_id);
    Response::builder()
        .status(StatusCode::NOT_FOUND)
        .body(Body::from_string(include_str!("./404.html").to_string()))
}

#[handler]
async fn resolve_http(request: &Request, state: Data<&State>) -> impl IntoResponse {
    // extract host and path
    let headers = request.headers();
    let host = headers.get("host").and_then(|h| h.to_str().ok()).unwrap_or("localhost");
    let raw_path = request.uri().path();
    let path = raw_path.trim_start_matches('/').to_string();
    let state_ref = *state;

    info!("Router request at: {} {}", host, path);

    // 1) domain -> Deployment
    let domain_key = host.to_string();
    let state_for_domain = state_ref.clone();
    let maybe_dep = state_ref.cache.domain.get_with(domain_key.clone(), async move {
        get_last_deployment(host, &state_for_domain).await.ok()
    }).await;
    let deployment = if let Some(dep) = maybe_dep { dep } else {
        return Response::builder()
            .status(StatusCode::NOT_FOUND)
            .body(Body::from_string(include_str!("./404.html").to_string()));
    };
    let deployment_id = deployment.deployment_id;

    // 2) deployment_id + path -> DeploymentFileEntry
    let entry_key = format!("{}:{}", &deployment_id, path);
    let state_for_file = state_ref.clone();
    let deployment_str = deployment_id.to_string();
    let state_for_file_str = state_for_file.clone();
    let maybe_file = state_ref.cache.file_entry.get_with(entry_key.clone(), async move {
        DeploymentFile::get_file_by_path(&state_for_file_str.database, &deployment_str, &path).await.ok()
    }).await;
    if let Some(deployment_file) = maybe_file {
        return serve_deployment_file(deployment_file, state_ref).await;
    }

    // 3) SPA fallback -> index.html
    let spa_key = format!("{}:index.html", &deployment_id);
    let deployment_str = deployment_id.to_string();
    let maybe_spa = state_ref.cache.file_entry.get_with(spa_key.clone(), async move {
        DeploymentFile::get_file_by_path(&state_for_file.database, &deployment_str, "index.html").await.ok()
    }).await;
    if let Some(deployment_file) = maybe_spa {
        return serve_deployment_file(deployment_file, state_ref).await;
    }

    // 4) 404
    Response::builder()
        .status(StatusCode::NOT_FOUND)
        .body(Body::from_string(include_str!("./404.html").to_string()))
}

async fn get_last_deployment(host: &str, state: &State) -> Result<Deployment, HttpError> {
    // get domain
    // get site
    // get last deployment
    // get file at path in deployment
    // otherwise return default /index.html if exists
    let domain = Domain::existing_domain_by_name(host, &state.clone())
        .await
        .ok()
        .flatten();

    if let Some(domain) = domain {
        let site = Site::get_by_id(&state.clone().database, &domain.site_id)
            .await
            .ok();

        if let Some(site) = site {
            let deployment =
                Deployment::get_last_by_site_id(&state.clone().database, &site.site_id)
                    .await
                    .ok();

            if let Some(deployment) = deployment {
                return Ok(deployment);
            }
        }
    }

    Err(HttpError::NotFound)
}

/// Serve a deployment file entry, using full in-memory cache for eligible files or streaming otherwise.
async fn serve_deployment_file(deployment_file: DeploymentFileEntry, state: &State) -> Response {
    let mime = deployment_file.deployment_file_mime_type.clone();
    let file_key = deployment_file.file_hash.clone();
    // full cache eligibility
    if (mime == "text/html" || HTML_CACHE_FILE_EXTENSIONS.contains(&deployment_file.deployment_file_file_path.split('.').last().unwrap_or("")))
        && deployment_file.file_size.unwrap_or(0) <= HTML_CACHE_SIZE_LIMIT as i64
    {
        // in-memory cache hit
        if let Some(bytes) = state.cache.file_bytes.get(&file_key).await {
            return Response::builder()
                .status(StatusCode::OK)
                .header("content-type", mime.clone())
                .body(Body::from_bytes(bytes.clone()));
        }
        // fetch and cache
        if let Ok(data) = state.storage.bucket.get_object(&file_key).await {
            let bytes = data.into_bytes();
            state.cache.file_bytes.insert(file_key.clone(), bytes.clone());
            return Response::builder()
                .status(StatusCode::OK)
                .header("content-type", mime.clone())
                .body(Body::from_bytes(bytes));
        }
        // on error, fallthrough to internal error
        return Response::builder()
            .status(StatusCode::INTERNAL_SERVER_ERROR)
            .body(Body::from_string("Failed to load file".to_string()));
    }
    // streaming fallback
    match state.storage.bucket.get_object_stream(file_key).await {
                Ok(s3_data) => {
                    let stream = s3_data.bytes.map(|chunk| {
                        chunk.map_err(|e| {
                        info!("Error streaming file: {}", e);
                    IoError::new(ErrorKind::Other, e)
                    })
                });
                let body = Body::from_bytes_stream(stream);
            Response::builder()
                    .status(StatusCode::OK)
                .header("content-type", mime)
                .body(body)
                }
        Err(_) => Response::builder()
                        .status(StatusCode::INTERNAL_SERVER_ERROR)
            .body(Body::from_string("Failed to stream file".to_string())),
    }
}
