use std::{convert::Infallible, sync::Arc};

use hyper::body::Bytes;
use reqwest::Client;

use crate::AppState;

pub async fn request(client: &Client, url: &str) -> Result<Bytes, Infallible> {
    let res = client.get(url).send().await.unwrap();

    Ok(res.bytes().await.unwrap())
}

pub async fn exists(client: Arc<AppState>, url: &str) -> Result<bool, Infallible> {
    let res = client.http.head(url).send().await.unwrap();

    Ok(res.status().is_success())
}
