use thiserror;

pub type Result<T> = std::result::Result<T, Error>;

#[derive(Debug, thiserror::Error)]
pub enum Error {
    #[error(transparent)]
    Envy(#[from] envy::Error),

    #[error(transparent)]
    Reqwest(#[from] reqwest::Error),

    #[error(transparent)]
    NetworkError(#[from] crate::network::NetworkError),

    #[error("The backend {0} is unsupported potentially due to not being configured")]
    UnsupportedBackend(String),

    #[error("The backend {0} is unknown")]
    UnknownBackend(String),
}
