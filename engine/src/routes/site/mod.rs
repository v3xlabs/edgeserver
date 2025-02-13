use poem::{web::Data, Result};
use poem_openapi::{
    param::Path, payload::Json, types::multipart::Upload, Multipart, Object, OpenApi,
};
use serde::{Deserialize, Serialize};
use tracing::info;

use crate::{
    middlewares::auth::UserAuth,
    models::{
        deployment::{Deployment, DeploymentFile, DeploymentFileEntry},
        site::{Site, SiteId},
        team::Team,
    },
    routes::ApiTags,
    state::State,
};

use super::error::HttpError;

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

pub struct SiteApi;

#[OpenApi]
impl SiteApi {
    /// Get all sites
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

    #[oai(path = "/site/:site_id", method = "get", tag = "ApiTags::Site")]
    pub async fn get_site(
        &self,
        user: UserAuth,
        state: Data<&State>,
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

    #[oai(
        path = "/site/:site_id/deployments",
        method = "get",
        tag = "ApiTags::Site"
    )]
    pub async fn get_site_deployments(
        &self,
        user: UserAuth,
        state: Data<&State>,
        site_id: Path<String>,
    ) -> Result<Json<Vec<Deployment>>> {
        user.verify_access_to(&SiteId(&site_id.0)).await?;

        Site::get_deployments(&state.database, &site_id.0)
            .await
            .map_err(HttpError::from)
            .map(Json)
            .map_err(poem::Error::from)
    }

    #[oai(path = "/site/:site_id", method = "put", tag = "ApiTags::Site")]
    pub async fn update_site(&self, user: UserAuth, site_id: Path<String>) -> Result<Json<Site>> {
        info!("Updating site: {:?} for user: {:?}", site_id.0, user);

        user.verify_access_to(&SiteId(&site_id.0)).await?;

        todo!();
    }

    #[oai(path = "/site/:site_id", method = "delete", tag = "ApiTags::Site")]
    pub async fn delete_site(&self, user: UserAuth, site_id: Path<String>) -> Result<Json<Site>> {
        info!("Deleting site: {:?} for user: {:?}", site_id.0, user);

        user.verify_access_to(&SiteId(&site_id.0)).await?;

        todo!();
    }

    #[oai(
        path = "/site/:site_id/deployment/:deployment_id",
        method = "get",
        tag = "ApiTags::Site"
    )]
    pub async fn get_deployment(
        &self,
        user: UserAuth,
        state: Data<&State>,
        site_id: Path<String>,
        deployment_id: Path<String>,
    ) -> Result<Json<Deployment>> {
        user.verify_access_to(&SiteId(&site_id.0)).await?;

        Deployment::get_by_id(&state.database, &deployment_id.0)
            .await
            .map_err(HttpError::from)
            .map(Json)
            .map_err(poem::Error::from)
    }

    #[oai(
        path = "/site/:site_id/deployment",
        method = "post",
        tag = "ApiTags::Site"
    )]
    pub async fn create_deployment(
        &self,
        user: UserAuth,
        state: Data<&State>,
        site_id: Path<String>,
        payload: UploadPayload,
    ) -> Result<Json<Deployment>> {
        info!(
            "Creating deployment for site: {:?} for user: {:?}",
            site_id.0, user
        );

        user.verify_access_to(&SiteId(&site_id.0)).await?;

        let site_id = site_id.0;

        info!("Uploading file: {:?}", payload.data);

        let deployment = Deployment::new(&state.database, site_id, payload.context)
            .await
            .map_err(HttpError::from)?;

        info!("Deployment complete");

        if let Some(data) = payload.data {
            Deployment::upload_files(&deployment, &state, data)
                .await
                .unwrap();
        }

        // let cutoff_date = Utc::now() - Duration::days(365);
        // Deployment::cleanup_old_files(&state, cutoff_date)
        //     .await
        //     .unwrap();

        Ok(Json(deployment))
    }

    #[oai(
        path = "/site/:site_id/deployment/:deployment_id/files",
        method = "patch",
        tag = "ApiTags::Site"
    )]
    pub async fn upload_files(
        &self,
        user: UserAuth,
        state: Data<&State>,
        site_id: Path<String>,
        deployment_id: Path<String>,
        payload: UploadPayload,
    ) -> Result<Json<Deployment>> {
        info!(
            "Uploading files for deployment: {:?} for site: {:?} for user: {:?}",
            deployment_id.0, site_id.0, user
        );

        user.verify_access_to(&SiteId(&site_id.0)).await?;

        let deployment_id = deployment_id.0;
        
        info!("Uploading file: {:?}", payload.data);

        let deployment = Deployment::get_by_id(&state.database, &deployment_id)
            .await
            .map_err(HttpError::from)?;

        info!("Deployment complete");

        if let Some(data) = payload.data {
            Deployment::upload_files(&deployment, &state, data)
                .await
                .unwrap();
        }

        Ok(Json(deployment))
    }

    #[oai(
        path = "/site/:site_id/deployment/:deployment_id/files",
        method = "get",
        tag = "ApiTags::Site"
    )]
    pub async fn get_deployment_files(
        &self,
        user: UserAuth,
        state: Data<&State>,
        site_id: Path<String>,
        deployment_id: Path<String>,
    ) -> Result<Json<Vec<DeploymentFileEntry>>> {
        user.verify_access_to(&SiteId(&site_id.0)).await?;

        DeploymentFile::get_deployment_files(&state.database, &deployment_id.0)
            .await
            .map_err(HttpError::from)
            .map(Json)
            .map_err(poem::Error::from)
    }
}
