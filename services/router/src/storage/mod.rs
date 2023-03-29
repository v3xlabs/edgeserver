use std::{convert::Infallible, sync::Arc};

use hyper::body::Bytes;
use reqwest::Client;

pub mod http;
pub mod minio;

pub async fn request(
    client: &Client,
    app_state: Arc<crate::AppState>,
    storage_backend: &str,
    location: &str,
) -> Result<Bytes, Infallible> {
    // Figure out what storage backend
    match storage_backend {
        "minio" => minio::request(client, app_state, location).await,
        "http" => http::request(client, location).await,
        _ => panic!("Unknown storage backend"),
    }
}
