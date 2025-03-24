use poem::{
    http::HeaderMap,
    web::{Data, RealIp},
    Result,
};
use poem_openapi::{payload::Json, types::Example, Object, OpenApi};
use serde::{Deserialize, Serialize};
use tracing::info;

use crate::{
    models::{session::Session, team::Team, user::User},
    routes::ApiTags,
    state::State,
    utils::hash::hash_password,
};

use super::error::HttpError;

pub struct AuthApi;

#[derive(Deserialize, Debug, Object)]
#[oai(example)]
pub struct LoginRequest {
    username: String,
    password: String,
}

impl Example for LoginRequest {
    fn example() -> Self {
        Self {
            username: "john".to_string(),
            password: "password123".to_string(),
        }
    }
}
#[derive(Serialize, Debug, Object)]
#[oai(example)]
pub struct LoginResponse {
    token: String,
}

impl Example for LoginResponse {
    fn example() -> Self {
        Self {
            token: "se_0123456789abcdef0123456789abcdef".to_string(),
        }
    }
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
    pub user: User,
    pub team: Team,
}

#[OpenApi]
impl AuthApi {
    #[oai(path = "/auth/login", method = "post", tag = "ApiTags::Auth")]
    async fn login(
        &self,
        state: Data<&State>,
        request: Json<LoginRequest>,
        ip: RealIp,
        headers: &HeaderMap,
    ) -> Result<Json<LoginResponse>> {
        let user = User::get_by_name_and_password(
            &state.0.database,
            &request.username,
            &hash_password(&request.password),
        )
        .await
        .map_err(HttpError::from)?;

        let user_agent = headers.get("user-agent").unwrap().to_str().unwrap();
        let user_ip = ip.0.unwrap();

        let (token, session) = Session::new(&state.0.database, &user.user_id, user_agent, &user_ip)
            .await
            .map_err(HttpError::from)?;

        info!("New session created: {:?}", session);

        Ok(Json(LoginResponse { token }))
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
            Some(true),
            None,
        )
        .await
        .map_err(HttpError::from)?;

        Ok(Json(BootstrapUserResponse { user, team }))
    }
}
