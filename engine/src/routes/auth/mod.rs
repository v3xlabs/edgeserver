use poem::{web::Data, Result};
use poem_openapi::{payload::Json, Object, OpenApi};
use serde::{Deserialize, Serialize};

use crate::{
    models::{team::Team, user::User},
    routes::ApiTags,
    state::State, utils::hash::hash_password,
};

use super::error::HttpError;

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

#[derive(Serialize, Debug, Object)]
pub struct CanBootstrapResponse {
    can_bootstrap: bool,
}

#[derive(Deserialize, Debug, Object)]
pub struct BootstrapUserRequest {
    username: String,
    password: String,
}

#[derive(Serialize, Debug, Object)]
pub struct BootstrapUserResponse {
    user: User,
    team: Team,
}

#[OpenApi]
impl AuthApi {
    #[oai(path = "/auth/login", method = "post", tag = "ApiTags::Auth")]
    async fn login(
        &self,
        state: Data<&State>,
        request: Json<LoginRequest>,
    ) -> Result<Json<LoginResponse>> {
        let user =
            User::get_by_name_and_password(&state.0.database, &request.username, &hash_password(&request.password))
                .await
                .map_err(HttpError::from)?;

        Ok(Json(LoginResponse {
            token: "123".to_string(),
        }))
    }

    #[oai(path = "/auth/bootstrap", method = "get", tag = "ApiTags::Auth")]
    async fn can_bootstrap(&self, state: Data<&State>) -> Result<Json<CanBootstrapResponse>> {
        User::can_bootstrap(&state.0.database)
            .await
            .map_err(HttpError::from)
            .map(|can_bootstrap| Json(CanBootstrapResponse { can_bootstrap }))
            .map_err(poem::Error::from)
    }

    #[oai(path = "/auth/bootstrap", method = "post", tag = "ApiTags::Auth")]
    async fn bootstrap_user(
        &self,
        state: Data<&State>,
        request: Json<BootstrapUserRequest>,
    ) -> Result<Json<BootstrapUserResponse>> {
        if !User::can_bootstrap(&state.0.database)
            .await
            .map_err(HttpError::from)?
        {
            return Err(HttpError::Forbidden.into());
        }

        let (user, team) = User::new(
            &state.0.database,
            &request.username,
            &hash_password(&request.password),
        )
        .await
        .map_err(HttpError::from)?;

        Ok(Json(BootstrapUserResponse { user, team }))
    }
}
