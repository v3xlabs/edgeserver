use poem::{web::Data, Result};
use poem_openapi::{param::Path, payload::Json, OpenApi};
use tracing::info;

use crate::{
    middlewares::auth::UserAuth,
    models::user::{User, UserMinimal},
    routes::{error::HttpError, ApiTags},
    state::State,
};

pub struct UserApi;

#[OpenApi]
impl UserApi {
    #[oai(path = "/user", method = "get", tag = "ApiTags::User")]
    pub async fn get_user(&self, user: UserAuth, state: Data<&State>) -> Result<Json<User>> {
        info!("Getting user: {:?}", user);

        let user_id = &user.required()?.user_id;

        let user = User::get_by_id(&state.database, &user_id)
            .await
            .map_err(HttpError::from)?;

        Ok(Json(user))
    }

    #[oai(path = "/user/all", method = "get", tag = "ApiTags::User")]
    pub async fn get_all_users(
        &self,
        state: Data<&State>,
        auth: UserAuth,
    ) -> Result<Json<Vec<UserMinimal>>> {
        auth.required()?;

        let users = User::get_all_minimal(&state.database)
            .await
            .map_err(HttpError::from)?;

        Ok(Json(users))
    }

    #[oai(path = "/user/:user_id", method = "get", tag = "ApiTags::User")]
    pub async fn get_user_by_id(
        &self,
        user: UserAuth,
        user_id: Path<String>,
        state: Data<&State>,
    ) -> Result<Json<User>> {
        user.required()?;

        User::get_by_id(&state.database, &user_id.0)
            .await
            .map_err(HttpError::from)
            .map(Json)
            .map_err(poem::Error::from)
    }
}
