use poem::error::ResponseError;
use poem::IntoResponse;
use reqwest::StatusCode;
use tracing::error;

#[derive(Debug, thiserror::Error)]
pub enum HttpError {
    #[error("Anyhow error: {0}")]
    AnyhowError(#[from] color_eyre::eyre::Error),

    #[error("Database error: {0}")]
    DatabaseError(#[from] sqlx::Error),

    #[error("Already exists")]
    AlreadyExists,

    #[error("Resource not found")]
    NotFound,

    #[error("Forbidden")]
    Forbidden,

    #[error("Unauthorized")]
    Unauthorized,
}

impl ResponseError for HttpError {
    fn as_response(&self) -> poem::Response
    where
        Self: std::error::Error + Send + Sync + 'static,
    {
        poem::Response::default()
            .with_status(self.status())
            .into_response()
    }
    fn status(&self) -> StatusCode {
        match self {
            Self::AlreadyExists => StatusCode::CONFLICT,
            Self::NotFound => StatusCode::NOT_FOUND,
            Self::AnyhowError(_) => {
                error!("Anyhow error: {:?}", self);
                StatusCode::INTERNAL_SERVER_ERROR
            }
            Self::DatabaseError(_) => {
                error!("Database error: {:?}", self);
                StatusCode::INTERNAL_SERVER_ERROR
            }
            Self::Unauthorized => StatusCode::UNAUTHORIZED,
            other => {
                error!("Unknown error: {:?}", other);
                StatusCode::BAD_REQUEST
            }
        }
    }
}
