use std::convert::Infallible;

use hyper::body::Bytes;
use reqwest::Client;

pub async fn request(client: &Client, url: &str) -> Result<Bytes, Infallible> {
    let res = client.get(url).send().await.unwrap();

    Ok(res.bytes().await.unwrap())
}
