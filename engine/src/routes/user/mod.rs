use std::ops::Deref;

use poem::Result;
use poem_openapi::{payload::Json, OpenApi};
use tracing::info;

use crate::{middlewares::auth::UserAuth, models::user::User, routes::ApiTags};

pub struct UserApi;

#[OpenApi]
impl UserApi {
    #[oai(path = "/user", method = "get", tag = "ApiTags::User")]
    pub async fn get_user(&self, user: UserAuth) -> Result<Json<User>> {
        info!("Getting user: {:?}", user);

        let user = user.required()?;

        Ok(Json(user.clone()))
    }
}
