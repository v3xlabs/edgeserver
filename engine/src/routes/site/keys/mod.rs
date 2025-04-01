use chrono::Utc;
use poem::{web::Data, Result};
use poem_openapi::{param::Path, payload::Json, Object, OpenApi};
use reqwest::StatusCode;
use serde::{Deserialize, Serialize};

use crate::{
    middlewares::auth::UserAuth,
    models::{keys::{Key, NewKey}, site::SiteId},
    routes::{error::HttpError, ApiTags},
    state::State,
};

#[derive(Debug, Deserialize, Serialize, Object)]
pub struct CreateSiteKeyRequest {
    pub permissions: String,
}

pub struct SiteKeysApi;

#[OpenApi]
impl SiteKeysApi {
    /// Get all site keys
    #[oai(path = "/site/:site_id/keys", method = "get", tag = "ApiTags::Site")]
    pub async fn get_site_keys(
        &self,
        user: UserAuth,
        #[oai(name = "site_id", style = "simple")] site_id: Path<String>,
        state: Data<&State>,
    ) -> Result<Json<Vec<Key>>> {
        user.verify_access_to(&SiteId(&site_id.0)).await?;

        let keys = Key::get_for_resource(&state.database, "site", site_id.as_ref())
            .await
            .map_err(HttpError::from)
            .map_err(poem::Error::from)?;
        Ok(Json(keys))
    }

    /// Create a site key
    /// 
    /// (user-only)
    #[oai(path = "/site/:site_id/keys", method = "post", tag = "ApiTags::Site")]
    pub async fn create_site_key(
        &self,
        user: UserAuth,
        #[oai(name = "site_id", style = "simple")] site_id: Path<String>,
        payload: Json<CreateSiteKeyRequest>,
        state: Data<&State>,
    ) -> Result<Json<NewKey>> {
        user.verify_access_to(&SiteId(&site_id.0)).await?;

        let user = user.required_session()?;

        let key = Key::new(
            &state.database,
            "site".to_string(),
            site_id.0.clone(),
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

    /// Delete a site key
    /// 
    /// (user-only)
    #[oai(path = "/site/:site_id/keys/:key_id", method = "delete", tag = "ApiTags::Site")]
    pub async fn delete_site_key(
        &self,
        user: UserAuth,
        #[oai(name = "site_id", style = "simple")] site_id: Path<String>,
        #[oai(name = "key_id", style = "simple")] key_id: Path<String>,
        state: Data<&State>,
    ) -> Result<Json<serde_json::Value>> {
        user.verify_access_to(&SiteId(&site_id.0)).await?;

        let user = user.required_session()?;

        let key = Key::get_by_id(&state.database, key_id.as_ref())
            .await
            .map_err(HttpError::from)
            .map_err(poem::Error::from)?;

        if key.is_none() {
            return Err(poem::Error::from_status(StatusCode::NOT_FOUND));
        }

        let key = key.unwrap();

        if key.key_type != "site" || key.key_resource != site_id.0 {
            return Err(poem::Error::from_status(StatusCode::FORBIDDEN));
        }

        Key::delete(&state.database, key_id.as_ref())
            .await
            .map_err(HttpError::from)
            .map_err(poem::Error::from)?;

        Ok(Json(serde_json::json!({})))
    }
}
