use poem::{web::Data, Result};
use poem_openapi::{param::Path, payload::Json, OpenApi};
use tracing::info;

use crate::{
    middlewares::auth::UserAuth,
    models::{
        deployment::{preview::DeploymentPreview, Deployment, DeploymentFile, DeploymentFileEntry}, domain::Domain, site::{Site, SiteId}
    },
    routes::{error::HttpError, ApiTags},
    state::State,
};

use super::UploadPayload;

pub struct SiteDeploymentsApi;

#[OpenApi]
impl SiteDeploymentsApi {
    /// Get all deployments
    #[oai(
        path = "/site/:site_id/deployments",
        method = "get",
        tag = "ApiTags::Deployment"
    )]
    pub async fn get_site_deployments(
        &self,
        user: UserAuth,
        state: Data<&State>,
        #[oai(name = "site_id", style = "simple")] site_id: Path<String>,
    ) -> Result<Json<Vec<Deployment>>> {
        user.verify_access_to(&SiteId(&site_id.0)).await?;

        Site::get_deployments(&state.database, &site_id.0)
            .await
            .map_err(HttpError::from)
            .map(Json)
            .map_err(poem::Error::from)
    }

    /// Get a deployment by id
    #[oai(
        path = "/site/:site_id/deployment/:deployment_id",
        method = "get",
        tag = "ApiTags::Deployment"
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

    /// Get a deployment preview by id
    #[oai(
        path = "/site/:site_id/deployment/:deployment_id/preview",
        method = "get",
        tag = "ApiTags::Deployment"
    )]
    pub async fn get_deployment_preview(
        &self,
        user: UserAuth,
        state: Data<&State>,
        site_id: Path<String>,
        deployment_id: Path<String>,
    ) -> Result<Json<Vec<DeploymentPreview>>> {
        user.verify_access_to(&SiteId(&site_id.0)).await?;

        DeploymentPreview::get_by_deployment_id_public(&state, &site_id.0, &deployment_id.0)
            .await
            .map_err(HttpError::from)
            .map(Json)
            .map_err(poem::Error::from)
    }

    /// Create a new deployment
    #[oai(
        path = "/site/:site_id/deployment",
        method = "post",
        tag = "ApiTags::Deployment"
    )]
    pub async fn create_deployment(
        &self,
        user: UserAuth,
        state: Data<&State>,
        site_id: Path<String>,
        payload: UploadPayload,
    ) -> Result<Json<Deployment>> {
        user.verify_access_to(&SiteId(&site_id.0)).await?;

        info!(
            "Creating deployment for site: {:?} for user: {:?}",
            site_id.0, user
        );

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

    /// Upload files to a deployment
    #[oai(
        path = "/site/:site_id/deployment/:deployment_id/files",
        method = "patch",
        tag = "ApiTags::Deployment"
    )]
    pub async fn upload_files(
        &self,
        user: UserAuth,
        state: Data<&State>,
        site_id: Path<String>,
        deployment_id: Path<String>,
        payload: UploadPayload,
    ) -> Result<Json<Deployment>> {
        user.verify_access_to(&SiteId(&site_id.0)).await?;

        info!(
            "Uploading files for deployment: {:?} for site: {:?} for user: {:?}",
            deployment_id.0, site_id.0, user
        );

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

        // update context on deployment
        if let Some(context) = payload.context {
            Deployment::update_context(&state.database, &deployment_id, &context)
                .await
                .unwrap();
        }

        // TODO: improve trigger based on routing implementation
        // get first domain if exists for site
        let domain = Domain::get_by_site_id(&site_id.0, &state)
            .await
            .ok()
            .and_then(|domains| domains.first().cloned());

        if let Some(domain) = domain {
            info!("A domain was found for this site");
            if let Some(rabbit) = &state.rabbit {
                info!("Queueing bunshot for domain: {:?}", domain);
                let domain = domain.domain();
                rabbit.queue_bunshot(&site_id.0, &deployment_id, &domain).await;
            }
        } else {
            info!("No domain was found for this site");
        }

        Ok(Json(deployment))
    }

    /// Get all files for a deployment
    #[oai(
        path = "/site/:site_id/deployment/:deployment_id/files",
        method = "get",
        tag = "ApiTags::Deployment"
    )]
    pub async fn get_deployment_files(
        &self,
        user: UserAuth,
        state: Data<&State>,
        site_id: Path<String>,
        deployment_id: Path<String>,
    ) -> Result<Json<Vec<DeploymentFileEntry>>> {
        user.verify_access_to(&SiteId(&site_id.0)).await?;

        let deployment = Deployment::get_by_id(&state.database, &deployment_id.0)
            .await
            .map_err(HttpError::from)?;

        if deployment.site_id != site_id.0 {
            Err(HttpError::Forbidden)?;
        }

        DeploymentFile::get_deployment_files(&state.database, &deployment_id.0)
            .await
            .map_err(HttpError::from)
            .map(Json)
            .map_err(poem::Error::from)
    }

    /// Request a deployment preview
    #[oai(
        path = "/site/:site_id/deployment/:deployment_id/preview",
        method = "post",
        tag = "ApiTags::Deployment"
    )]
    pub async fn create_deployment_preview(
        &self,
        user: UserAuth,
        state: Data<&State>,
        site_id: Path<String>,
        deployment_id: Path<String>,
    ) -> Result<Json<serde_json::Value>> {
        user.verify_access_to(&SiteId(&site_id.0)).await?;

        if let Some(rabbit) = &state.rabbit {
            info!("Queueing bunshot for deployment: {:?}", deployment_id.0);

            let domain = Domain::get_by_site_id(&site_id.0, &state)
                .await
                .ok()
                .and_then(|domains| domains.first().cloned());

            if let Some(domain) = domain {
                info!("Queueing bunshot for domain: {:?}", domain.domain());
                rabbit.queue_bunshot(&site_id.0, &deployment_id.0, &domain.domain()).await;
            } else {
                info!("No domain was found for this site");
            }
        } else {
            info!("No rabbit was found");
        }

        Ok(Json(serde_json::Value::Null))
    }
}
