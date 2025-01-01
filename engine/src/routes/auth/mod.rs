use poem::Result;
use poem_openapi::{payload::Json, Object, OpenApi};
use serde::{Deserialize, Serialize};

use crate::routes::ApiTags;

pub struct AuthApi;

#[derive(Deserialize, Debug, Object)]
pub struct LoginRequest {
    username: String,
    password: String,
}

#[derive(Serialize, Debug, Object)]
pub struct LoginResponse {
    token: String,
}

#[OpenApi]
impl AuthApi {
    #[oai(path = "/auth/login", method = "post", tag = "ApiTags::Auth")]
    async fn login(&self) -> Result<Json<LoginResponse>> {
        Ok(Json(LoginResponse {
            token: "123".to_string(),
        }))
    }
}
