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
pub struct CreateTeamKeyRequest {
    pub permissions: String,
}

pub struct TeamKeysApi;

#[OpenApi]
impl TeamKeysApi {
    /// Get all team keys
    #[oai(path = "/team/:team_id/keys", method = "get", tag = "ApiTags::Team")]
    pub async fn get_team_keys(
        &self,
        #[oai(name = "team_id", style = "simple")] team_id: Path<String>,
        state: Data<&State>,
    ) -> Result<Json<Vec<Key>>> {
        let keys = Key::get_for_resource(&state.database, "team", team_id.as_ref())
            .await
            .map_err(HttpError::from)
            .map_err(poem::Error::from)?;
        Ok(Json(keys))
    }

    /// Create a team key
    #[oai(path = "/team/:team_id/keys", method = "post", tag = "ApiTags::Team")]
    pub async fn create_team_key(
        &self,
        user: UserAuth,
        #[oai(name = "team_id", style = "simple")] team_id: Path<String>,
        payload: Json<CreateTeamKeyRequest>,
        state: Data<&State>,
    ) -> Result<Json<NewKey>> {
        let user = user.required_session()?;

        let key = Key::new(
            &state.database,
            "team".to_string(),
            team_id.0.clone(),
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

    /// Delete a team key
    #[oai(path = "/team/:team_id/keys/:key_id", method = "delete", tag = "ApiTags::Team")]
    pub async fn delete_team_key(
        &self,
        user: UserAuth,
        #[oai(name = "team_id", style = "simple")] team_id: Path<String>,
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

        Key::delete(&state.database, key_id.as_ref())
            .await
            .map_err(HttpError::from)
            .map_err(poem::Error::from)?;

        Ok(Json(serde_json::json!({})))
    }
}
