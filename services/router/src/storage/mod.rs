use std::{convert::Infallible, sync::Arc};

use hyper::body::Bytes;

pub mod http;
pub mod minio;

pub async fn request(
    app_state: Arc<crate::AppState>,
    storage_backend: &str,
    location: &str,
) -> Result<Bytes, Infallible> {
    // Figure out what storage backend
    match storage_backend {
        "minio" => minio::request(app_state, location).await,
        "http" => http::request(&app_state.http, location).await,
        _ => panic!("Unknown storage backend"),
    }
}

pub async fn exists(
    app_state: Arc<crate::AppState>,
    storage_backend: &str,
    location: &str,
) -> Result<bool, Infallible> {
    // Figure out what storage backend
    match storage_backend {
        "minio" => minio::exists(app_state, location).await,
        "http" => http::exists(app_state, location).await,
        _ => panic!("Unknown storage backend"),
    }
}
