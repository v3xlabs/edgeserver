use std::sync::Arc;

use crate::cache::ResolveResult;
use futures::StreamExt;
use opentelemetry::global;
use poem::middleware::OpenTelemetryMetrics;
use poem::web::Data;
use poem::{get, handler, listener::TcpListener, middleware::Cors, Route, Server};
use poem::{Body, EndpointExt, IntoResponse, Request, Response};
use reqwest::StatusCode;
use tracing::info;

use crate::middlewares::tracing::TraceId;
use crate::models::deployment::{Deployment, DeploymentFile};
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

#[handler]
async fn resolve_http(request: &Request, state: Data<&State>) -> impl IntoResponse {
    // extract host and path
    let headers = request.headers();
    let host = headers
        .get("host")
        .and_then(|h| h.to_str().ok())
        .unwrap_or("localhost");
    let raw_path = request.uri().path();
    let path = raw_path.trim_start_matches('/');

    info!("Router request at: {} {}", host, path);

    // resolution cache for domain + path lookup
    let cache_key = format!("resolve:{}:{}", host, path);
    let state_for_cache = state.clone();
    let host_for_cache = host.to_string();
    let path_for_cache = path.to_string();

    let cached_resolve: ResolveResult = state
        .cache
        .resolve
        .get_with(cache_key.clone(), async move {
            match get_last_deployment(&host_for_cache, &state_for_cache.clone()).await {
                Ok(deployment) => {
                    let lookup_path = if path_for_cache.is_empty() {
                        "index.html"
                    } else {
                        path_for_cache.as_str()
                    };
                    match DeploymentFile::get_file_by_path(
                        &state_for_cache.clone().database,
                        &deployment.deployment_id,
                        lookup_path,
                    )
                    .await
                    {
                        Ok(entry) => ResolveResult::Success(entry),
                        Err(_) => {
                            ResolveResult::NotFound(format!("File not found: {}", lookup_path))
                        }
                    }
                }
                Err(err) => {
                    let msg = err.to_string();
                    if let HttpError::NotFound = err {
                        ResolveResult::NotFound(msg)
                    } else {
                        ResolveResult::Error(msg)
                    }
                }
            }
        })
        .await;

    // handle the resolved result
    match cached_resolve {
        ResolveResult::Success(deployment_file) => {
            info!(
                "Serving file: {} (cached lookup)",
                deployment_file.file_hash
            );
            // if eligible for full caching
            if (deployment_file.deployment_file_mime_type == "text/html"
                || HTML_CACHE_FILE_EXTENSIONS.contains(
                    &deployment_file
                        .deployment_file_file_path
                        .split('.')
                        .last()
                        .unwrap_or(""),
                ))
                && deployment_file.file_size.unwrap_or(0) <= HTML_CACHE_SIZE_LIMIT as i64
            {
                let file_key = deployment_file.file_hash.clone();
                // serve from in-memory cache if present
                if let Some(cached_bytes) = state.cache.file_bytes.get(&file_key).await {
                    let body = Body::from_bytes(cached_bytes.clone());
                    return Response::builder()
                        .status(StatusCode::OK)
                        .header(
                            "content-type",
                            deployment_file.deployment_file_mime_type.clone(),
                        )
                        .body(body);
                }
                // fetch from S3 and cache
                match state.storage.bucket.get_object(&file_key).await {
                    Ok(data) => {
                        let bytes = data.into_bytes();
                        state
                            .cache
                            .file_bytes
                            .insert(file_key.clone(), bytes.clone());
                        let body = Body::from_bytes(bytes);
                        return Response::builder()
                            .status(StatusCode::OK)
                            .header(
                                "content-type",
                                deployment_file.deployment_file_mime_type.clone(),
                            )
                            .body(body);
                    }
                    Err(e) => {
                        info!("Error loading full HTML file: {}", e);
                        return Response::builder()
                            .status(StatusCode::INTERNAL_SERVER_ERROR)
                            .body(Body::from_string(e.to_string()));
                    }
                }
            }
            // otherwise, stream as before
            let s3_path = deployment_file.file_hash.clone();
            match state.storage.bucket.get_object_stream(s3_path).await {
                Ok(s3_data) => {
                    let stream = s3_data.bytes.map(|chunk| {
                        chunk.map_err(|e| {
                            info!("Error streaming file: {}", e);
                            std::io::Error::new(std::io::ErrorKind::Other, e)
                        })
                    });
                    let body = Body::from_bytes_stream(stream);
                    return Response::builder()
                        .status(StatusCode::OK)
                        .header(
                            "content-type",
                            deployment_file.deployment_file_mime_type.clone(),
                        )
                        .body(body);
                }
                Err(e) => {
                    info!("Error streaming file: {}", e);
                    return Response::builder()
                        .status(StatusCode::INTERNAL_SERVER_ERROR)
                        .body(Body::from_string(e.to_string()));
                }
            }
        }
        ResolveResult::NotFound(reason) => {
            // SPA fallback when the specific file isn't found
            info!("Not found: {}, attempting SPA fallback", reason);
            // Try index.html for SPA routing
            let spa_cache_key = format!("resolve:{}:index.html", host);
            let state_for_spa = state.clone();
            let host_for_spa = host.to_string();
            let spa_result: ResolveResult = state
                .cache
                .resolve
                .get_with(spa_cache_key.clone(), async move {
                    match get_last_deployment(&host_for_spa, &state_for_spa.clone()).await {
                        Ok(deployment) => {
                            match DeploymentFile::get_file_by_path(
                                &state_for_spa.clone().database,
                                &deployment.deployment_id,
                                "index.html",
                            )
                            .await
                            {
                                Ok(entry) => ResolveResult::Success(entry),
                                Err(_) => {
                                    ResolveResult::NotFound("SPA index.html not found".to_string())
                                }
                            }
                        }
                        Err(err) => {
                            let msg = err.to_string();
                            if let HttpError::NotFound = err {
                                ResolveResult::NotFound(msg)
                            } else {
                                ResolveResult::Error(msg)
                            }
                        }
                    }
                })
                .await;
            // If SPA index.html found, serve it using same caching logic
            if let ResolveResult::Success(deployment_file) = spa_result {
                info!("Serving SPA index.html for {} {}", host, path);
                // full in-memory cache eligible?
                if (deployment_file.deployment_file_mime_type == "text/html"
                    || HTML_CACHE_FILE_EXTENSIONS.contains(
                        &deployment_file
                            .deployment_file_file_path
                            .split('.')
                            .last()
                            .unwrap_or(""),
                    ))
                    && deployment_file.file_size.unwrap_or(0) <= HTML_CACHE_SIZE_LIMIT as i64
                {
                    let file_key = deployment_file.file_hash.clone();
                    // check in-memory cache
                    if let Some(cached_bytes) = state.cache.file_bytes.get(&file_key).await {
                        let body = Body::from_bytes(cached_bytes.clone());
                        return Response::builder()
                            .status(StatusCode::OK)
                            .header(
                                "content-type",
                                deployment_file.deployment_file_mime_type.clone(),
                            )
                            .body(body);
                    }
                    // fetch and cache
                    if let Ok(data) = state.storage.bucket.get_object(&file_key).await {
                        let bytes = data.into_bytes();
                        state
                            .cache
                            .file_bytes
                            .insert(file_key.clone(), bytes.clone());
                        let body = Body::from_bytes(bytes);
                        return Response::builder()
                            .status(StatusCode::OK)
                            .header(
                                "content-type",
                                deployment_file.deployment_file_mime_type.clone(),
                            )
                            .body(body);
                    }
                }
                // otherwise, stream from S3
                let s3_path = deployment_file.file_hash.clone();
                if let Ok(s3_data) = state.storage.bucket.get_object_stream(s3_path).await {
                    let stream = s3_data.bytes.map(|chunk| {
                        chunk.map_err(|e| {
                            info!("Error streaming SPA index: {}", e);
                            std::io::Error::new(std::io::ErrorKind::Other, e)
                        })
                    });
                    let body = Body::from_bytes_stream(stream);
                    return Response::builder()
                        .status(StatusCode::OK)
                        .header(
                            "content-type",
                            deployment_file.deployment_file_mime_type.clone(),
                        )
                        .body(body);
                }
            }
            // default 404 if SPA fallback failed
            info!(
                "SPA fallback failed for {} {}, returning default 404",
                host, path
            );
            return Response::builder()
                .status(StatusCode::NOT_FOUND)
                .body(Body::from_string(include_str!("./404.html").to_string()));
        }
        ResolveResult::Error(err) => {
            info!("Resolution error: {}", err);
            return Response::builder()
                .status(StatusCode::INTERNAL_SERVER_ERROR)
                .body(Body::from_string(err));
        }
    }
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
