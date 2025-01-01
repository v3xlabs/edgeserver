use poem::Result;
use poem_openapi::{param::Path, payload::Json, OpenApi};
use tracing::info;

use crate::{middlewares::auth::UserAuth, models::site::Site, routes::ApiTags};

pub struct SiteApi;

#[OpenApi]
impl SiteApi {
    /// Get all sites
    ///
    /// Gets a list of all the sites you have access to
    #[oai(path = "/site", method = "get", tag = "ApiTags::Site")]
    pub async fn get_sites(&self, user: UserAuth) -> Result<Json<Vec<Site>>> {
        info!("Getting sites for user: {:?}", user);

        Ok(Json(vec![Site {
            site_id: "1".to_string(),
            name: "John Doe".to_string(),
        }]))
    }

    #[oai(path = "/site", method = "post", tag = "ApiTags::Site")]
    pub async fn create_site(&self, user: UserAuth) -> Result<Json<Site>> {
        info!("Creating site for user: {:?}", user);

        todo!();
    }

    #[oai(path = "/site/:site_id", method = "get", tag = "ApiTags::Site")]
    pub async fn get_site_certs(&self, user: UserAuth, site_id: Path<String>) -> Result<Json<Site>> {
        info!("Getting site: {:?} for user: {:?}", site_id.0, user);

        todo!();
    }

    #[oai(path = "/site/:site_id", method = "put", tag = "ApiTags::Site")]
    pub async fn update_site(&self, user: UserAuth, site_id: Path<String>) -> Result<Json<Site>> {
        info!("Updating site: {:?} for user: {:?}", site_id.0, user);

        todo!();
    }

    #[oai(path = "/site/:site_id", method = "delete", tag = "ApiTags::Site")]
    pub async fn delete_site(&self, user: UserAuth, site_id: Path<String>) -> Result<Json<Site>> {
        info!("Deleting site: {:?} for user: {:?}", site_id.0, user);

        todo!();
    }
}
