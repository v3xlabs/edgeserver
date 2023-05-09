use tracing::debug;

use {
    crate::{
        error::{Error, Result},
        storage::Storage,
        AppState,
    },
    async_trait::async_trait,
    hyper::body::Bytes,
    reqwest::Client,
    std::sync::Arc,
};

#[derive(Debug, Clone)]
pub struct HttpStorage {
    client: Client,
}

impl Default for HttpStorage {
    fn default() -> Self {
        HttpStorage {
            client: Default::default(),
        }
    }
}

#[async_trait]
impl Storage<String> for HttpStorage {
    async fn request(&self, _app_state: &Arc<AppState>, url: String) -> Result<(Bytes, String)> {
        let res = self.client.get(url).send().await?;

        let headers = res.headers();

        let mime_type = headers
            .get("content-type")
            .map(|v| v.to_str().unwrap_or_default().to_string())
            .unwrap_or_default();

        let bytes = res.bytes().await;

        if let Err(e) = bytes {
            return Err(Error::Reqwest(e));
        }

        Ok((bytes.unwrap(), mime_type))
    }

    async fn exists(&self, _app_state: &Arc<AppState>, url: String) -> Result<bool> {
        let res = self.client.get(url.clone()).send().await.unwrap();

        let status = res.status().is_success();
        // debug!("HEAD {} => {}", &url, res.status());
        let re = res.bytes().await.map_err(Error::Reqwest)?;
        debug!("v {:?}", re);

        Ok(status)
    }
}
