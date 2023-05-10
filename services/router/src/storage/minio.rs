use {
    crate::{error::Result, storage::Storage, AppState},
    async_trait::async_trait,
    hyper::body::Bytes,
    std::sync::Arc,
    tracing::debug
};

#[derive(Clone, Debug)]
pub struct MinioStorage {
    pub(crate) url: String,
    pub(crate) bucket: String,
}

#[async_trait]
impl Storage<String> for MinioStorage {
    async fn request(&self, app_state: &Arc<AppState>, path: String) -> Result<(Bytes, String)> {
        let url = format!("{}/{}/{}", self.url, self.bucket, path);

        debug!("Requesting {}", url);

        app_state.storage.http.request(app_state, url).await
    }

    async fn exists(&self, app_state: &Arc<AppState>, path: String) -> Result<bool> {
        let url = format!("{}/{}/{}", self.url, self.bucket, path);

        app_state.storage.http.exists(app_state, url).await
    }
}
