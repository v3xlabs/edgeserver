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
impl Storage for HttpStorage {
    async fn request(&self, _app_state: &Arc<AppState>, url: &str) -> Result<Bytes> {
        let res = self.client.get(url).send().await?;

        res.bytes().await.map_err(|e| Error::Reqwest(e))
    }

    async fn exists(&self, _app_state: &Arc<AppState>, url: &str) -> Result<bool> {
        let res = self.client.head(url).send().await.unwrap();

        Ok(res.status().is_success())
    }
}
