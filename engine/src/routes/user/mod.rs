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

        Ok(Json(User {
            user_id: "1".to_string(),
            name: "John Doe".to_string(),
            created_at: chrono::Utc::now(),
            password: "".to_string(),
        }))
    }
}
