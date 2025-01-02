use poem::error::ResponseError;
use poem::IntoResponse;
use reqwest::StatusCode;

#[derive(Debug, thiserror::Error)]
pub enum HttpError {
    #[error("Anyhow error: {0}")]
    AnyhowError(#[from] anyhow::Error),

    #[error("Database error: {0}")]
    DatabaseError(#[from] sqlx::Error),

    #[error("Already exists")]
    AlreadyExists,

    #[error("Resource not found")]
    NotFound,

    #[error("Forbidden")]
    Forbidden,
}

impl ResponseError for HttpError {
    fn as_response(&self) -> poem::Response
        where
            Self: std::error::Error + Send + Sync + 'static, {
        poem::Response::default().with_status(StatusCode::BAD_REQUEST).into_response()
    }
    fn status(&self) -> StatusCode {
        match self {
            HttpError::AlreadyExists => StatusCode::CONFLICT,
            HttpError::NotFound => StatusCode::NOT_FOUND,
            HttpError::AnyhowError(_) => StatusCode::INTERNAL_SERVER_ERROR,
            HttpError::DatabaseError(_) => StatusCode::INTERNAL_SERVER_ERROR,
            _ => StatusCode::BAD_REQUEST,
        }
    }
}
