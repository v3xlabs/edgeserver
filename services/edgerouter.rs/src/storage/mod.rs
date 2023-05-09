use self::signalfs::SignalStorage;

use {
    crate::{
        error::{Error, Result},
        state::AppState,
        storage::{http::HttpStorage, minio::MinioStorage},
    },
    async_trait::async_trait,
    hyper::body::Bytes,
    std::sync::Arc,
};

pub mod http;
pub mod minio;
pub mod signalfs;

#[derive(Clone, Debug)]
pub struct StorageProviders<S, M, H>
where
    S: Storage<(String, String)>,
    M: Storage<String>,
    H: Storage<String>,
{
    pub(crate) signalfs: Option<Arc<S>>,
    pub(crate) minio: Option<Arc<M>>,
    pub(crate) http: Arc<H>,
}

impl StorageProviders<SignalStorage, MinioStorage, HttpStorage> {
    pub async fn request(
        &self,
        app_state: &Arc<AppState>,
        fs: &str,
        cid: String,
        location: String,
    ) -> Result<(Bytes, String)> {
        match fs {
            "signalfs" => match &self.signalfs {
                Some(signalfs) => signalfs.request(&app_state, (cid, location)).await,
                None => Err(Error::UnsupportedBackend("signalfs".to_string())),
            },
            "minio" => match &self.minio {
                Some(minio) => minio.request(&app_state, location).await,
                None => Err(Error::UnsupportedBackend("minio".to_string())),
            },
            "http" => self.http.request(&app_state, location).await,
            backend => Err(Error::UnknownBackend(backend.to_string())),
        }
    }

    pub async fn exists(
        &self,
        app_state: &Arc<AppState>,
        fs: &str,
        cid: String,
        location: String,
    ) -> Result<bool> {
        match fs {
            "signalfs" => match &self.signalfs {
                Some(signalfs) => signalfs.exists(&app_state, (cid, location)).await,
                None => Err(Error::UnsupportedBackend("signalfs".to_string())),
            },
            "minio" => match &self.minio {
                Some(minio) => minio.exists(&app_state, location).await,
                None => Err(Error::UnsupportedBackend("minio".to_string())),
            },
            "http" => self.http.exists(&app_state, location).await,
            backend => Err(Error::UnknownBackend(backend.to_string())),
        }
    }
}

#[async_trait]
pub trait Storage<T> {
    async fn request(&self, app_state: &Arc<AppState>, location: T) -> Result<(Bytes, String)>;

    async fn exists(&self, app_state: &Arc<AppState>, location: T) -> Result<bool>;
}
