use poem::{web::Data, Result};
use poem_openapi::{payload::Json, OpenApi};
use tracing::info;

use crate::{middlewares::auth::UserAuth, models::user::User, routes::{error::HttpError, ApiTags}, state::State};

pub struct UserApi;

#[OpenApi]
impl UserApi {
    #[oai(path = "/user", method = "get", tag = "ApiTags::User")]
    pub async fn get_user(&self, user: UserAuth, state: Data<&State>) -> Result<Json<User>> {
        info!("Getting user: {:?}", user);

        let user_id = &user.required()?.user_id;

        let user = User::get_by_id(&state.database, &user_id).await.map_err(HttpError::from)?;

        Ok(Json(user))
    }
}
