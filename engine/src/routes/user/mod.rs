use keys::UserKeysApi;
use poem::{web::Data, Result};
use poem_openapi::{param::Path, payload::Json, OpenApi};
use tracing::info;

use crate::{
    middlewares::auth::UserAuth,
    models::user::{User, UserMinimal},
    routes::{error::HttpError, ApiTags},
    state::State,
};

pub mod keys;

pub fn api_routes() -> impl OpenApi {
    (UserApi, UserKeysApi)
}

#[derive(Debug)]
pub struct UserApi;

#[OpenApi]
impl UserApi {
    /// Get the current user
    #[tracing::instrument(skip(user, state))]
    #[oai(path = "/user", method = "get", tag = "ApiTags::User")]
    pub async fn get_user(&self, user: UserAuth, state: Data<&State>) -> Result<Json<User>> {
        info!("Getting user: {:?}", user);

        let user_id = &user.required_session()?.user_id;

        let user = User::get_by_id(&state.database, &user_id)
            .await
            .map_err(HttpError::from)?;

        Ok(Json(user))
    }

    /// Get all users
    #[oai(path = "/user/all", method = "get", tag = "ApiTags::User")]
    pub async fn get_all_users(
        &self,
        state: Data<&State>,
        auth: UserAuth,
    ) -> Result<Json<Vec<UserMinimal>>> {
        auth.required_session()?;

        let users = User::get_all_minimal(&state.database)
            .await
            .map_err(HttpError::from)?;

        Ok(Json(users))
    }

    /// Get a user by id
    #[oai(path = "/user/:user_id", method = "get", tag = "ApiTags::User")]
    pub async fn get_user_by_id(
        &self,
        user: UserAuth,
        #[oai(name = "user_id", style = "simple")]
        user_id: Path<String>,
        state: Data<&State>,
    ) -> Result<Json<User>> {
        user.required_session()?;

        User::get_by_id(&state.database, &user_id.0)
            .await
            .map_err(HttpError::from)
            .map(Json)
            .map_err(poem::Error::from)
    }
}
