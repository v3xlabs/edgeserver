use poem::Result;
use poem_openapi::{payload::Json, OpenApi};

use crate::models::user::User;

pub struct UserApi;

#[OpenApi]
impl UserApi {
    #[oai(path = "/user", method = "get")]
    pub async fn get_user(&self) -> Result<Json<User>> {
        Ok(Json(User {
            id: "1".to_string(),
            name: "John Doe".to_string(),
        }))
    }
}
