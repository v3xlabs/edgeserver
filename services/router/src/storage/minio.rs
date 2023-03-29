use std::{convert::Infallible, sync::Arc};

use hyper::body::Bytes;
use reqwest::Client;

pub async fn request(
    client: &Client,
    state: Arc<crate::AppState>,
    path: &str,
) -> Result<Bytes, Infallible> {
    let minio = state.minio.clone().unwrap();

    let url = format!("{}/{}/{}", minio.url, minio.bucket, path);

    crate::storage::http::request(client, &url).await
}
