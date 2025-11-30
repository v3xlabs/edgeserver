use chrono::Utc;
use poem::{web::Data, Result};
use poem_openapi::{param::Path, payload::Json, Object, OpenApi};
use reqwest::StatusCode;
use serde::{Deserialize, Serialize};

use crate::{
    middlewares::auth::UserAuth,
    models::keys::{Key, NewKey},
    routes::{error::HttpError, ApiTags},
    state::State,
};

#[derive(Debug, Deserialize, Serialize, Object)]
pub struct CreateUserKeyRequest {
    pub permissions: String,
}

pub struct UserKeysApi;

#[OpenApi]
impl UserKeysApi {
    /// Get all user keys
    #[oai(path = "/user/keys", method = "get", tag = "ApiTags::User")]
    pub async fn get_user_keys(
        &self,
        user: UserAuth,
        state: Data<&State>,
    ) -> Result<Json<Vec<Key>>> {
        let user = user.required_session()?;

        let keys = Key::get_for_resource(&state.database, "user", &user.user_id)
            .await
            .map_err(HttpError::from)
            .map_err(poem::Error::from)?;
        Ok(Json(keys))
    }

    /// Create a user key
    #[oai(path = "/user/keys", method = "post", tag = "ApiTags::User")]
    pub async fn create_user_key(
        &self,
        user: UserAuth,
        payload: Json<CreateUserKeyRequest>,
        state: Data<&State>,
    ) -> Result<Json<NewKey>> {
        let user = user.required_session()?;

        let key = Key::new(
            &state.database,
            "user".to_string(),
            user.user_id.clone(),
            payload.permissions.clone(),
            user.user_id.to_string(),
            Utc::now(),
            None,
            None,
        )
        .await
        .map_err(HttpError::from)
        .map_err(poem::Error::from)?;
        Ok(Json(key))
    }

    /// Delete a user key
    #[oai(path = "/user/keys/:key_id", method = "delete", tag = "ApiTags::User")]
    pub async fn delete_user_key(
        &self,
        user: UserAuth,
        #[oai(name = "key_id", style = "simple")] key_id: Path<String>,
        state: Data<&State>,
    ) -> Result<Json<serde_json::Value>> {
        let user = user.required_session()?;

        let key = Key::get_by_id(&state.database, key_id.as_ref())
            .await
            .map_err(HttpError::from)
            .map_err(poem::Error::from)?;

        if key.is_none() {
            return Err(poem::Error::from_status(StatusCode::NOT_FOUND));
        }

        let key = key.unwrap();

        if key.key_type != "user" || key.key_resource != user.user_id {
            return Err(poem::Error::from_status(StatusCode::FORBIDDEN));
        }

        Key::delete(&state.database, key_id.as_ref())
            .await
            .map_err(HttpError::from)
            .map_err(poem::Error::from)?;

        Ok(Json(serde_json::json!({})))
    }
}
