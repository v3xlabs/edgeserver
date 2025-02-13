use async_zip::base::read::mem::ZipFileReader;
use chrono::{Duration, Utc};
use poem::{web::Data, Result};
use poem_openapi::{
    param::Path, payload::Json, types::multipart::Upload, Multipart, Object, OpenApi,
};
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};
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
    data: Upload,
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

        let content_type = payload.data.content_type().unwrap().to_string();
        let file_stream = payload.data.into_vec().await.unwrap();

        // TODO: Read file stream, extract zip file (contains multiple files), upload each file to s3 at the correct relevant path relative to deployment.deployment_id + '/'

        let zip = ZipFileReader::new(file_stream).await.unwrap();

        for index in 0..zip.file().entries().len() {
            let file = zip.file().entries().get(index).unwrap();
            let path = file.filename().as_str().unwrap();
            let entry_is_dir = file.dir().unwrap();

            if entry_is_dir {
                info!("Skipping directory: {:?}", path);
                continue;
            }

            let mut file_content = zip.reader_with_entry(index).await.unwrap();

            let mut buf = Vec::new();
            file_content.read_to_end_checked(&mut buf).await.unwrap();

            // hash the file
            info!("Hashing file: {:?}", path);
            let file_hash = hash_file(&buf);

            let content_type = infer::get(&buf).map(|t| t.mime_type().to_string()).unwrap_or_default();
            let file_size = buf.len() as i64;

            info!("Cataloging metadata for file: {:?}", path);
            let x = deployment
                .upload_file(&state.database, path, &file_hash, &content_type, file_size)
                .await
                .unwrap();

            if x.is_new.unwrap_or_default() {
                info!("Uploading file: {:?}", path);

                let s3_path = file_hash.to_string();
                state
                    .storage
                    .bucket
                    .put_object_with_content_type(&s3_path, &buf, &content_type)
                    .await
                    .unwrap();

                info!("Upload complete");
            } else {
                info!("File already exists, skipping upload");
            }
        }

        info!("Deployment complete");

        let cutoff_date = Utc::now() - Duration::seconds(30);
        Deployment::cleanup_old_files(&state, cutoff_date)
            .await
            .unwrap();

        Ok(Json(deployment))
    }
}

fn hash_file(file: &[u8]) -> String {
    let mut hasher = Sha256::new();
    hasher.update(file);
    let hash = hasher.finalize();
    format!("{:x}", hash)
}
