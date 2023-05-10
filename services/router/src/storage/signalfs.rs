use {
    crate::{error::Result, storage::Storage, AppState},
    async_trait::async_trait,
    hyper::body::Bytes,
    std::sync::Arc,
    tracing::debug,
};

#[derive(Clone, Debug)]
pub struct SignalStorage {
    pub(crate) url: String,
}

#[async_trait]
impl Storage<(String, String)> for SignalStorage {
    async fn request(&self, app_state: &Arc<AppState>, (sid, path): (String, String)) -> Result<(Bytes, String)> {
        let url = format!("{}/buckets/{}/get?path={}", self.url, sid, path);

        debug!("Requesting {}", url);

        app_state.storage.http.request(app_state, url).await
    }

    async fn exists(&self, app_state: &Arc<AppState>, (sid, path): (String, String)) -> Result<bool> {
        let url = format!("{}/buckets/{}/exists?path={}", self.url, sid, path);

        println!("Checking if {} exists", url);

        app_state.storage.http.exists(app_state, url).await
    }
}
