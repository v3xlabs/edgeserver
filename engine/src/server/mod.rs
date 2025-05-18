use std::sync::Arc;

use opentelemetry::global;
use poem::middleware::OpenTelemetryMetrics;
use poem::web::Data;
use poem::{Body, EndpointExt, IntoResponse, Request, Response};
use poem::{get, handler, listener::TcpListener, middleware::Cors, Route, Server};
use reqwest::StatusCode;
use tracing::info;
use futures::StreamExt;

use crate::middlewares::tracing::TraceId;
use crate::models::deployment::{Deployment, DeploymentFile};
use crate::models::domain::Domain;
use crate::models::site::Site;
use crate::routes::error::HttpError;
use crate::state::State;

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
    let headers = request.headers();
    let host = match headers.get("host") {
        Some(host) => host.to_str().unwrap_or("localhost"),
        None => "localhost",
    };
    let path = request.uri().path();
    let path = path.trim_start_matches('/');

    info!("Router request at: {} {}", host, path);

    let deployment = get_last_deployment(host, &state.clone()).await;

    if let Ok(deployment) = deployment {
        info!("Deployment found: {}", deployment.deployment_id);

        let path = if path.is_empty() {
            "index.html"
        } else {
            path
        };

        let file = DeploymentFile::get_file_by_path(&state.clone().database, &deployment.deployment_id, path)
            .await.ok();

        if let Some(deployment_file) = file {
            info!("File found: {}", deployment_file.file_hash);

            // stream file from s3 storage and return it
            let s3_path = deployment_file.file_hash.clone();
            if let Ok(s3_data) = state.storage.bucket.get_object_stream(s3_path).await {
                // Stream the S3 response bytes directly to the client
                let stream = s3_data.bytes.map(|chunk| {
                    chunk.map_err(|e| {
                        info!("Error streaming file: {}", e);
                        std::io::Error::new(std::io::ErrorKind::Other, e)
                    })
                });

                let body = Body::from_bytes_stream(stream);
                return Response::builder()
                    .status(StatusCode::OK)
                    .header("content-type", deployment_file.deployment_file_mime_type.clone())
                    .body(body);
            } else {
                info!("File not found in s3");
            }
        } else {
            info!("No file found");
        }
    } else {
        info!("No deployment found");
    }

    // inline 404 template
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
        .await.ok().flatten();

    if let Some(domain) = domain {
        let site = Site::get_by_id(&state.clone().database, &domain.site_id)
            .await.ok();

        if let Some(site) = site {
            let deployment = Deployment::get_last_by_site_id(&state.clone().database, &site.site_id)
                .await.ok();

            if let Some(deployment) = deployment {
                return Ok(deployment);
            }
        }
    }

    Err(HttpError::NotFound)
}
