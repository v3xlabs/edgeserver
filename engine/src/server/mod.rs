use chrono::{DateTime, Utc};
use std::io::{Error as IoError, ErrorKind};
use std::sync::Arc;

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
use opentelemetry::metrics::Meter;
use opentelemetry::KeyValue;

pub mod not_found;

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
async fn spa_fallback(
    deployment_id: &str,
    last_modified: DateTime<Utc>,
    cid: Option<String>,
    state: &State,
) -> Response {
    let spa_key = format!("{}:index.html", deployment_id);
    let deployment_str = deployment_id.to_string();
    let spa_entry: Option<DeploymentFileEntry> = state
        .cache
        .file_entry
        .get_with(spa_key.clone(), async move {
            DeploymentFile::get_file_by_path(&state.database, &deployment_str, "index.html")
                .await
                .ok()
        })
        .await;
    if let Some(entry) = spa_entry {
        return serve_deployment_file(entry, last_modified, cid, state).await;
    }
    // default 404
    info!("SPA fallback failed for deployment {}", deployment_id);
    not_found::not_found()
}

#[handler]
async fn resolve_http(request: &Request, state: Data<&State>) -> impl IntoResponse {
    // extract host and path
    let headers = request.headers();
    let host = headers
        .get("host")
        .and_then(|h| h.to_str().ok())
        .unwrap_or("localhost");
    let raw_path = request.uri().path();
    let path = raw_path.trim_start_matches('/').to_string();
    let state_ref = *state;

    let span = tracing::info_span!("resolve_http", host = host, path = path);

    // Record metrics for domain and path
    let meter = global::meter("edgeserver");
    let request_counter = meter
        .u64_counter("http_requests_total")
        .with_description("Count of HTTP requests by domain and path")
        .build();
    request_counter.add(1, &[
        KeyValue::new("domain", host.to_string()),
        KeyValue::new("path", path.clone()),
    ]);

    info!("Router request at: {} {}", host, path);

    // 1) domain -> Deployment
    let domain_key = host.to_string();
    let state_for_domain = state_ref.clone();
    let maybe_dep = state_ref
        .cache
        .domain
        .get_with(domain_key.clone(), async move {
            get_last_deployment(host, &state_for_domain).await.ok()
        })
        .await;
    let deployment = if let Some(dep) = maybe_dep {
        dep
    } else {
        tracing::error!("Deployment not found");
        return not_found::not_found();
    };
    let cid = deployment.ipfs_cid;
    let deployment_id = deployment.deployment_id;
    // record Last-Modified header value from this deployment
    let last_modified = deployment.created_at;

    // 2) deployment_id + path -> DeploymentFileEntry
    let entry_key = format!("{}:{}", &deployment_id, path);
    let state_for_file = state_ref.clone();
    let deployment_str = deployment_id.to_string();
    let state_for_file_str = state_for_file.clone();
    let path_str = path.clone();
    let maybe_file = state_ref
        .cache
        .file_entry
        .get_with(entry_key.clone(), async move {
            DeploymentFile::get_file_by_path(&state_for_file_str.database, &deployment_str, &path_str)
                .await
                .ok()
        })
        .await;
    if let Some(deployment_file) = maybe_file {
        return serve_deployment_file(deployment_file, last_modified, cid, state_ref).await;
    }

    // 2b) if path is a directory, try <path>/index.html
    if !path.is_empty() {
        let index_path = format!("{}/index.html", path);
        let index_key = format!("{}:{}", deployment_id, index_path);
        let state_for_index = state_ref.clone();
        let deployment_id_index = deployment_id.clone();
        let maybe_index = state_ref
            .cache
            .file_entry
            .get_with(index_key.clone(), async move {
                DeploymentFile::get_file_by_path(&state_for_index.database, &deployment_id_index, &index_path)
                    .await
                    .ok()
            })
            .await;
        if let Some(deployment_file) = maybe_index {
            return serve_deployment_file(deployment_file, last_modified, cid, state_ref).await;
        }
    }

    // 3) SPA fallback -> index.html
    let spa_key = format!("{}:index.html", deployment_id);
    let maybe_spa = state_ref
        .cache
        .file_entry
        .get_with(spa_key.clone(), async move {
            DeploymentFile::get_file_by_path(&state_for_file.database, &deployment_id, "index.html")
                .await
                .ok()
        })
        .await;
    if let Some(deployment_file) = maybe_spa {
        return serve_deployment_file(deployment_file, last_modified, cid, state_ref).await;
    }

    tracing::error!("404 Not Found");

    // 4) 404
    not_found::not_found()
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
#[tracing::instrument(name = "serve_deployment_file", skip(deployment_file, last_modified, cid, state))]
async fn serve_deployment_file(
    deployment_file: DeploymentFileEntry,
    last_modified: DateTime<Utc>,
    cid: Option<String>,
    state: &State,
) -> Response {
    let mime = polyfill_mime_type(&deployment_file.deployment_file_mime_type.clone(), &deployment_file.deployment_file_file_path);
    let file_key = deployment_file.file_hash.clone();
    // let cid_path = format!("{}/{}", cid.unwrap_or("".to_string()), deployment_file.deployment_file_file_path);

    // full cache eligibility
    if (mime == "text/html"
        || HTML_CACHE_FILE_EXTENSIONS.contains(
            &deployment_file
                .deployment_file_file_path
                .split('.')
                .last()
                .unwrap_or(""),
        ))
        && deployment_file.file_size.unwrap_or(0) <= HTML_CACHE_SIZE_LIMIT as i64
    {
        // in-memory cache hit
        if let Some(bytes) = state.cache.file_bytes.get(&file_key).await {
            // build response with standard headers
            let mut resp = Response::builder()
                .status(StatusCode::OK)
                .header("content-type", mime.clone())
                .header("ETag", format!("\"{}\"", file_key))
                .header("Last-Modified", last_modified.to_rfc2822())
                .header("Cache-Control", "max-age=300");
            // optionally include IPFS path
            if let Some(cid_val) = &cid {
                let ipfs_path = format!(
                    "/ipfs/{}/{}",
                    cid_val, deployment_file.deployment_file_file_path
                );
                resp = resp.header("x-ipfs-path", ipfs_path);
            }
            return resp.body(Body::from_bytes(bytes.clone()));
        }
        // fetch and cache
        if let Ok(data) = state.storage.bucket.get_object(&file_key).await {
            let bytes = data.into_bytes();
            state
                .cache
                .file_bytes
                .insert(file_key.clone(), bytes.clone());
            let mut resp = Response::builder()
                .status(StatusCode::OK)
                .header("content-type", mime.clone())
                .header("ETag", format!("\"{}\"", file_key))
                .header("Last-Modified", last_modified.to_rfc2822())
                .header("Cache-Control", "max-age=300");
            if let Some(cid_val) = &cid {
                let ipfs_path = format!(
                    "/ipfs/{}/{}",
                    cid_val, deployment_file.deployment_file_file_path
                );
                resp = resp.header("x-ipfs-path", ipfs_path);
            }
            return resp.body(Body::from_bytes(bytes));
        }
        // on error, fallthrough to internal error
        return Response::builder()
            .status(StatusCode::INTERNAL_SERVER_ERROR)
            .body(Body::from_string("Failed to load file".to_string()));
    }

    let span = tracing::info_span!("streaming_file");

    // streaming fallback (clone key so we can still use file_key afterwards)
    let s3_key = file_key.clone();
    match state.storage.bucket.get_object_stream(s3_key).await {
        Ok(s3_data) => {
            let stream = s3_data.bytes.map(|chunk| {
                chunk.map_err(|e| {
                    info!("Error streaming file: {}", e);
                    IoError::new(ErrorKind::Other, e)
                })
            });
            let body = Body::from_bytes_stream(stream);
            let mut resp = Response::builder()
                .status(StatusCode::OK)
                .header("content-type", mime)
                .header("ETag", format!("\"{}\"", file_key))
                .header("Last-Modified", last_modified.to_rfc2822())
                .header("Cache-Control", "max-age=300");
            if let Some(cid_val) = &cid {
                let ipfs_path = format!(
                    "/ipfs/{}/{}",
                    cid_val, deployment_file.deployment_file_file_path
                );
                resp = resp.header("x-ipfs-path", ipfs_path);
            }

            resp.body(body)
        }
        Err(_) => {
            Response::builder()
                .status(StatusCode::INTERNAL_SERVER_ERROR)
                .body(Body::from_string("Failed to stream file".to_string()))
        }
    }
}

fn polyfill_mime_type(mime: &str, file_name: &str) -> String {
    let extension = file_name.split('.').last().unwrap_or("");

    if mime == "text/xml" && extension == "svg" {
        "image/svg+xml".to_string()
    } else {
        mime.to_string()
    }
}
