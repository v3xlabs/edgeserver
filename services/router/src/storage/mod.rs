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

#[derive(Clone, Debug)]
pub struct StorageProviders<M, H>
where
    M: Storage,
    H: Storage,
{
    pub(crate) minio: Option<Arc<M>>,
    pub(crate) http: Arc<H>,
}

impl StorageProviders<MinioStorage, HttpStorage> {
    pub async fn request(
        &self,
        app_state: &Arc<AppState>,
        fs: &str,
        location: &str,
    ) -> Result<Bytes> {
        match fs {
            "minio" => match &self.minio {
                Some(minio) => minio.request(&app_state, location).await,
                None => Err(Error::UnsupportedBackend("minio".to_string())),
            },
            "http" => self.http.request(&app_state, location).await,
            backend => Err(Error::UnknownBackend(backend.to_string())),
        }
    }

    // TODO: uncomment if used or delete
    // pub async fn exists(&self, app_state: &Arc<AppState>, fs: &str, location:
    // &str) -> Result<bool> {     match fs {
    //         "minio" => match &self.minio {
    //             Some(minio) => minio.exists(&app_state, location).await,
    //             None => Err(Error::UnsupportedBackend("minio".to_string()))
    //         },
    //         "http" => self.http.exists(&app_state, location).await,
    //         backend => Err(Error::UnknownBackend(backend.to_string())),
    //     }
    // }
}

#[async_trait]
pub trait Storage {
    async fn request(&self, app_state: &Arc<AppState>, location: &str) -> Result<Bytes>;

    async fn exists(&self, app_state: &Arc<AppState>, location: &str) -> Result<bool>;
}
