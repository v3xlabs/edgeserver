use deployments::SiteDeploymentsApi;
use domains::SiteDomainsApi;
use keys::SiteKeysApi;
use poem::{web::Data, Result};
use poem_openapi::{
    param::Path, payload::Json, types::multipart::Upload, Multipart, Object, OpenApi,
};
use serde::{Deserialize, Serialize};
use tracing::info;

use crate::{
    middlewares::auth::UserAuth,
    models::{
        site::{Site, SiteId},
        team::Team,
    },
    routes::ApiTags,
    state::State,
};

use super::error::HttpError;

pub mod domains;
pub mod deployments;
pub mod keys;

#[derive(Debug, Deserialize, Serialize, Object)]
pub struct SiteCreateRequest {
    pub name: String,
    pub team_id: String,
}

#[derive(Debug, Object, Clone)]
struct File {
    name: String,
    desc: Option<String>,
    content_type: Option<String>,
    filename: Option<String>,
    data: Vec<u8>,
}

#[derive(Debug, Multipart)]
pub struct UploadPayload {
    data: Option<Upload>,
    context: Option<String>,
}

#[derive(Debug, Deserialize, Serialize, Object)]
pub struct CreateSiteDomainRequest {
    pub domain: String,
}

pub struct SiteApi;

pub fn api_routes() -> impl OpenApi {
    (SiteApi, SiteDeploymentsApi, SiteDomainsApi, SiteKeysApi)
}

#[OpenApi]
impl SiteApi {
    /// Get all sites personal
    ///
    /// Gets a list of all the sites you have access to
    #[oai(path = "/site", method = "get", tag = "ApiTags::Site")]
    pub async fn get_sites(&self, user: UserAuth, state: Data<&State>) -> Result<Json<Vec<Site>>> {
        info!("Getting sites for user: {:?}", user);

        let user = user.required()?;

        Site::get_by_user_id(&state.database, &user.user_id)
            .await
            .map_err(HttpError::from)
            .map(Json)
            .map_err(poem::Error::from)
    }

    /// Create a new site
    ///
    /// Creates a new site given a create request
    #[oai(path = "/site", method = "post", tag = "ApiTags::Site")]
    pub async fn create_site(
        &self,
        user: UserAuth,
        state: Data<&State>,
        payload: Json<SiteCreateRequest>,
    ) -> Result<Json<Site>> {
        info!("Creating site for user: {:?}", user);

        let user = user.required()?;

        if !Team::is_owner(&state.database, &payload.team_id, &user.user_id)
            .await
            .map_err(HttpError::from)?
        {
            Err(HttpError::Forbidden)?;
        }

        Site::new(&state.database, &payload.name, &payload.team_id)
            .await
            .map_err(HttpError::from)
            .map(Json)
            .map_err(poem::Error::from)
    }

    /// Get a site by id
    #[oai(path = "/site/:site_id", method = "get", tag = "ApiTags::Site")]
    pub async fn get_site(
        &self,
        user: UserAuth,
        state: Data<&State>,
        #[oai(name = "site_id", style = "simple")]
        site_id: Path<String>,
    ) -> Result<Json<Site>> {
        info!("Getting site: {:?} for user: {:?}", site_id.0, user);

        user.verify_access_to(&SiteId(&site_id.0)).await?;

        Site::get_by_id(&state.database, &site_id.0)
            .await
            .map_err(HttpError::from)
            .map(Json)
            .map_err(poem::Error::from)
    }

    /// Update a site
    #[oai(path = "/site/:site_id", method = "put", tag = "ApiTags::Site")]
    pub async fn update_site(
        &self, 
        user: UserAuth, 
        #[oai(name = "site_id", style = "simple")]
        site_id: Path<String>
    ) -> Result<Json<Site>> {
        info!("Updating site: {:?} for user: {:?}", site_id.0, user);

        user.verify_access_to(&SiteId(&site_id.0)).await?;

        todo!();
    }

    /// Delete a site
    #[oai(path = "/site/:site_id", method = "delete", tag = "ApiTags::Site")]
    pub async fn delete_site(
        &self, 
        user: UserAuth, 
        #[oai(name = "site_id", style = "simple")]
        site_id: Path<String>
    ) -> Result<Json<Site>> {
        info!("Deleting site: {:?} for user: {:?}", site_id.0, user);

        user.verify_access_to(&SiteId(&site_id.0)).await?;

        todo!();
    }

    /// Transfer a site
    #[oai(
        path = "/site/:site_id/transfer",
        method = "post",
        tag = "ApiTags::Site"
    )]
    pub async fn transfer_site(
        &self,
        user: UserAuth,
        state: Data<&State>,
        site_id: Path<String>,
        payload: Json<TransferSiteRequest>,
    ) -> Result<Json<Site>> {
        user.verify_access_to(&SiteId(&site_id.0)).await?;

        let user_ = user.required()?;

        let site = Site::get_by_id(&state.database, &site_id.0)
            .await
            .map_err(HttpError::from)?;

        if !Team::is_owner(&state.database, &site.team_id, &user_.user_id)
            .await
            .map_err(HttpError::from)?
        {
            Err(HttpError::Forbidden)?;
        }

        Site::update_team(&state.database, &site_id.0, &payload.team_id)
            .await
            .map_err(HttpError::from)?;

        let site = Site::get_by_id(&state.database, &site_id.0)
            .await
            .map_err(HttpError::from)?;

        Ok(Json(site))
    }
}

#[derive(Debug, Deserialize, Serialize, Object)]
pub struct TransferSiteRequest {
    pub team_id: String,
}
