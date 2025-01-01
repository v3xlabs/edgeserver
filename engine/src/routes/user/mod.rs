use poem::Result;
use poem_openapi::{payload::Json, OpenApi};
use tracing::info;

use crate::{middlewares::auth::UserAuth, models::user::User};

pub struct UserApi;

#[OpenApi]
impl UserApi {
    #[oai(path = "/user", method = "get")]
    pub async fn get_user(&self, user: UserAuth) -> Result<Json<User>> {
        info!("Getting user: {:?}", user);

        Ok(Json(User {
            user_id: "1".to_string(),
            name: "John Doe".to_string(),
        }))
    }
}
