use std::{convert::Infallible, sync::Arc};

use hyper::body::Bytes;

pub async fn request(
    state: Arc<crate::AppState>,
    path: &str,
) -> Result<Bytes, Infallible> {
    let minio = state.minio.clone().unwrap();

    let url = format!("{}/{}/{}", minio.url, minio.bucket, path);

    crate::storage::http::request(&state.http, &url).await
}

pub async fn exists(
    state: Arc<crate::AppState>,
    path: &str,
) -> Result<bool, Infallible> {
    let minio = state.minio.clone().unwrap();

    let url = format!("{}/{}/{}", minio.url, minio.bucket, path);

    crate::storage::http::exists(state, &url).await
}
