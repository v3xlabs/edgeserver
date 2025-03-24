use poem::{web::Data, Result};
use poem_openapi::{param::Path, payload::Json, OpenApi};
use serde_json::json;

use crate::{
    middlewares::auth::UserAuth, models::{domain::{Domain, DomainPending, DomainSubmission}, site::SiteId}, routes::{error::HttpError, ApiTags}, state::State
};

use super::CreateSiteDomainRequest;

pub struct SiteDomainsApi;

#[OpenApi]
impl SiteDomainsApi {
    /// /site/:site_id/domains
    ///
    /// Get all domains for a site
    #[oai(path = "/site/:site_id/domains", method = "get", tag = "ApiTags::Site")]
    pub async fn get_site_domains(
        &self,
        #[oai(name = "site_id", style = "simple")] site_id: Path<String>,
        state: Data<&State>,
    ) -> Result<Json<Vec<DomainSubmission>>> {
        let domains = Domain::get_by_site_id(site_id.0, &state)
            .await
            .map_err(HttpError::from)
            .map_err(poem::Error::from)?;
        Ok(Json(domains))
    }

    /// /site/:site_id/domains
    ///
    /// Create a new domain for a site
    #[oai(
        path = "/site/:site_id/domains",
        method = "post",
        tag = "ApiTags::Site"
    )]
    pub async fn create_site_domain(
        &self,
        user: UserAuth,
        state: Data<&State>,
        site_id: Path<String>,
        payload: Json<CreateSiteDomainRequest>,
    ) -> Result<Json<DomainSubmission>> {
        user.verify_access_to(&SiteId(&site_id.0)).await?;

        let _user_ = user.required()?;

        // validate domain is atleast 3 characters and has a dot seperator, no spaces, trim, etc
        // use regex to validate
        let domain_regex = regex::Regex::new(r"^(\*\.)?([a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?$").unwrap();
        if !domain_regex.is_match(&payload.domain) {
            // invalid domain
            Err(HttpError::NotFound)?;
        }

        let corrected_domain = payload.domain.trim();

        let domain = Domain::create_for_site(site_id.0, corrected_domain.to_string(), &state)
            .await
            .map_err(HttpError::from)
            .map(Json)
            .map_err(poem::Error::from);

        domain
    }

    /// /site/:site_id/domains/:domain
    ///
    /// Delete a domain for a site
    #[oai(
        path = "/site/:site_id/domains/:domain",
        method = "delete",
        tag = "ApiTags::Site"
    )]
    pub async fn delete_site_domain(
        &self,
        user: UserAuth,
        state: Data<&State>,
        site_id: Path<String>,
        domain: Path<String>,
    ) -> Result<Json<serde_json::Value>> {
        user.verify_access_to(&SiteId(&site_id.0)).await?;

        let existing_domain = Domain::get_by_site_id_and_domain(&site_id.0, &domain.0, &state)
            .await
            .map_err(HttpError::from)?;

        if let Some(_existing_domain) = existing_domain {
            Domain::delete_by_site_id_and_domain(&site_id.0, &domain.0, &state)
                .await
                .map_err(HttpError::from)?;

            return Ok(Json(json!({
                "message": "Domain deleted"
            })));
        }

        let existing_domain_pending =
            DomainPending::get_by_site_id_and_domain(&site_id.0, &domain.0, &state)
                .await
                .map_err(HttpError::from)?;

        if let Some(_existing_domain_pending) = existing_domain_pending {
            DomainPending::delete_by_site_id_and_domain(&site_id.0, &domain.0, &state)
                .await
                .map_err(HttpError::from)?;

            return Ok(Json(json!({
                "message": "Domain deleted"
            })));
        }

        Err(HttpError::NotFound.into())
    }
}
