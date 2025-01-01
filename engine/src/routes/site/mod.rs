use poem::Result;
use poem_openapi::{payload::Json, OpenApi};
use tracing::info;

use crate::{middlewares::auth::UserAuth, models::site::Site};

pub struct SiteApi;

#[OpenApi]
impl SiteApi {
    /// Get all sites
    ///
    /// Gets a list of all the sites you have access to
    #[oai(path = "/site", method = "get")]
    pub async fn get_sites(&self, user: UserAuth) -> Result<Json<Vec<Site>>> {
        info!("Getting sites for user: {:?}", user);

        Ok(Json(vec![Site {
            site_id: "1".to_string(),
            name: "John Doe".to_string(),
        }]))
    }
}
