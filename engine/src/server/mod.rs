use chrono::{DateTime, Utc};
use std::io::{Error as IoError, ErrorKind};
use std::sync::Arc;

use futures::StreamExt;
use opentelemetry::global;
use poem::middleware::OpenTelemetryMetrics;
use poem::web::Data;
use poem::{get, handler, listener::TcpListener, middleware::Cors, Route, Server};
use poem::{Body, EndpointExt, Request, Response};
use reqwest::StatusCode;
use tracing::info;

use crate::middlewares::tracing::TraceId;
use crate::models::deployment::{Deployment, DeploymentFile, DeploymentFileEntry};
use crate::models::domain::Domain;
use crate::models::site::Site;
use crate::routes::error::HttpError;
use crate::state::State;
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
async fn resolve_http(request: &Request, state: Data<&State>) -> Result<Response, HttpError> {
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
    request_counter.add(
        1,
        &[
            KeyValue::new("domain", host.to_string()),
            KeyValue::new("path", path.clone()),
        ],
    );

    info!("Router request at: {} {}", host, path);

    // 1) domain -> Deployment
    let domain_key = host.to_string();
    let state_for_domain = state_ref.clone();
    let maybe_dep = state_ref
        .cache
        .domain
        .try_get_with(domain_key.clone(), async move {
            get_last_deployment(host, &state_for_domain).await
        })
        .await?;
    let deployment = if let Some(dep) = maybe_dep {
        dep
    } else {
        tracing::error!("Deployment not found");
        return Ok(not_found::not_found());
    };
    let cid = deployment.ipfs_cid;
    let deployment_id = deployment.deployment_id;
    // record Last-Modified header value from this deployment
    let last_modified = deployment.created_at;

    let directory_index = (!path.is_empty()).then(|| format!("{}/index.html", path));
    for candidate in [
        Some(path.as_str()),
        directory_index.as_deref(),
        Some("index.html"),
    ]
    .into_iter()
    .flatten()
    {
        let entry_key = format!("{}:{}", deployment_id, candidate);
        let maybe_file = state_ref
            .cache
            .file_entry
            .try_get_with(entry_key, async {
                match DeploymentFile::get_file_by_path(
                    &state_ref.database,
                    &deployment_id,
                    candidate,
                )
                .await
                {
                    Ok(file) => Ok(Some(file)),
                    Err(sqlx::Error::RowNotFound) => Ok(None),
                    Err(error) => Err(error),
                }
            })
            .await?;
        if let Some(deployment_file) = maybe_file {
            return Ok(serve_deployment_file(deployment_file, last_modified, cid, state_ref).await);
        }
    }

    tracing::error!("404 Not Found");

    // 4) 404
    Ok(not_found::not_found())
}

async fn get_last_deployment(host: &str, state: &State) -> Result<Option<Deployment>, sqlx::Error> {
    // get domain
    // get site
    // get last deployment
    // get file at path in deployment
    // otherwise return default /index.html if exists
    let domain = Domain::existing_domain_by_name(host, &state.clone()).await?;

    if let Some(domain) = domain {
        if let Some(ref dep_id) = domain.active_deployment_id {
            match Deployment::get_by_id(&state.database, dep_id).await {
                Ok(dep) => return Ok(Some(dep)),
                Err(sqlx::Error::RowNotFound) => {}
                Err(error) => return Err(error),
            }
        }

        // Fallback to getting the latest deployment by site_id

        let site = match Site::get_by_id(&state.clone().database, &domain.site_id).await {
            Ok(site) => site,
            Err(sqlx::Error::RowNotFound) => return Ok(None),
            Err(error) => return Err(error),
        };

        match Deployment::get_last_by_site_id(&state.clone().database, &site.site_id).await {
            Ok(deployment) => return Ok(Some(deployment)),
            Err(sqlx::Error::RowNotFound) => {}
            Err(error) => return Err(error),
        }
    }

    Ok(None)
}

/// Serve a deployment file entry, using full in-memory cache for eligible files or streaming otherwise.
#[tracing::instrument(
    name = "serve_deployment_file",
    skip(deployment_file, last_modified, cid, state)
)]
async fn serve_deployment_file(
    deployment_file: DeploymentFileEntry,
    last_modified: DateTime<Utc>,
    cid: Option<String>,
    state: &State,
) -> Response {
    let mime = polyfill_mime_type(
        &deployment_file.deployment_file_mime_type.clone(),
        &deployment_file.deployment_file_file_path,
    );
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
        Err(_) => Response::builder()
            .status(StatusCode::INTERNAL_SERVER_ERROR)
            .body(Body::from_string("Failed to stream file".to_string())),
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

#[cfg(test)]
mod tests {
    use std::{sync::Arc, time::Duration};

    use chrono::Utc;
    use poem::{get, http::StatusCode, Endpoint, EndpointExt, Request, Response, Route};
    use sqlx::postgres::PgPoolOptions;

    use super::resolve_http;
    use crate::{
        cache::Cache,
        database::Database,
        models::deployment::Deployment,
        state::{AppConfig, AppState, S3Config, State},
        storage::Storage,
    };

    fn state_without_postgres() -> State {
        let config = AppConfig {
            database_url: String::new(),
            s3: S3Config {
                endpoint_url: "http://127.0.0.1:1".into(),
                region: "us-east-1".into(),
                bucket_name: "edgeserver".into(),
                access_key: "access".into(),
                secret_key: "secret".into(),
            },
            s3_previews: None,
            s3_car: None,
            github_app: None,
            amqp: None,
            ipfs: None,
        };
        let pool = PgPoolOptions::new()
            .acquire_timeout(Duration::from_millis(200))
            .connect_lazy("postgres://edgeserver@127.0.0.1:1/edgeserver")
            .unwrap();
        Arc::new(AppState {
            storage: Storage::from_config(&config),
            config,
            database: Database { pool },
            cache: Cache::default(),
            rabbit: None,
            ipfs: None,
        })
    }

    async fn fetch(state: &State, path: &str) -> Response {
        let app = Route::new().at("*", get(resolve_http)).data(state.clone());
        let request = Request::builder()
            .uri(path.parse().unwrap())
            .header("host", "site.test")
            .finish();
        app.get_response(request).await
    }

    fn assert_unavailable(response: &Response) {
        assert_eq!(response.status(), StatusCode::SERVICE_UNAVAILABLE);
        assert_eq!(response.headers()["cache-control"], "no-store");
    }

    #[async_std::test]
    async fn failed_domain_lookup_is_not_cached_as_missing_site() {
        let state = state_without_postgres();

        assert_unavailable(&fetch(&state, "/").await);
        assert!(!state.cache.domain.contains_key("site.test"));
    }

    #[async_std::test]
    async fn failed_file_lookup_is_not_cached_as_missing_file() {
        let state = state_without_postgres();
        let deployment = Deployment {
            deployment_id: "d".into(),
            site_id: "s".into(),
            context: None,
            ipfs_cid: None,
            created_at: Utc::now(),
        };
        state
            .cache
            .domain
            .insert("site.test".into(), Some(deployment))
            .await;

        assert_unavailable(&fetch(&state, "/about.html").await);
        assert!(!state.cache.file_entry.contains_key("d:about.html"));
    }
}
