use chrono::{DateTime, Utc};
use poem_openapi::{Object, Union};
use serde::{Deserialize, Serialize};
use sqlx::{Error, FromRow};
use tracing::info;

use crate::state::State;

#[derive(
    Debug, Clone, PartialEq, Eq, PartialOrd, Ord, Hash, Serialize, Deserialize, FromRow, Object,
)]
pub struct Domain {
    pub site_id: String,
    pub domain: String,
    pub created_at: DateTime<Utc>,
}

impl Domain {
    pub async fn get_by_site_id(
        site_id: String,
        state: &State,
    ) -> Result<Vec<DomainSubmission>, Error> {
        let domains: Vec<Domain> =
            sqlx::query_as!(Domain, "SELECT * FROM domains WHERE site_id = $1", site_id)
                .fetch_all(&state.database.pool)
                .await?;

        let pending_domains: Vec<DomainPending> = sqlx::query_as!(
            DomainPending,
            "SELECT * FROM domains_pending WHERE site_id = $1",
            site_id
        )
        .fetch_all(&state.database.pool)
        .await?;

        Ok(domains
            .into_iter()
            .map(|domain| domain.into())
            .chain(pending_domains.into_iter().map(|pending| pending.into()))
            .collect())
    }

    pub async fn create_for_site(
        site_id: String,
        domain: String,
        state: &State,
    ) -> Result<DomainSubmission, Error> {
        // check if domain exist by name
        let overlap = if domain.starts_with("*.") {
            Domain::existing_wildcard_overlap_by_name(domain.clone(), state).await
        } else {
            Domain::existing_domain_by_name(domain.clone(), state)
                .await
                .map(|x| vec![x])
        }
        .ok()
        .unwrap_or_default();

        if !overlap.is_empty() {
            for existing_domain in overlap {
                info!(
                    "Domain already exists, creating domain pending: {}",
                    existing_domain.domain
                );

                if existing_domain.site_id == site_id && existing_domain.domain == domain {
                    // if already exists as domain on this site
                    return Ok(existing_domain.into());
                }

                let domain_pending_exists = DomainPending::get_by_site_id_and_domain(
                    existing_domain.site_id.clone(),
                    existing_domain.domain.clone(),
                    state,
                )
                .await;

                if let Ok(domain_pending) = domain_pending_exists {
                    // already exists as pending on this site
                    return Ok(domain_pending.into());
                }
            }

            return Ok(DomainPending::create(site_id, domain, state).await?.into());
        }

        let domain = sqlx::query_as!(
            Domain,
            "INSERT INTO domains (site_id, domain) VALUES ($1, $2) RETURNING *",
            site_id,
            domain
        )
        .fetch_one(&state.database.pool)
        .await?;

        Ok(domain.into())
    }

    pub async fn existing_domain_by_name(domain: String, state: &State) -> Result<Domain, Error> {
        let domain = sqlx::query_as!(Domain, "SELECT * FROM domains WHERE domain = $1", domain)
            .fetch_one(&state.database.pool)
            .await?;

        Ok(domain)
    }

    /// Given a wildcard domain `*.luc.computer` it will return all downwards overlapping domains
    /// 
    /// Given `*.luc.computer` it will return `['hello.world.luc.computer', '*.dev.luc.computer', '*.computer']`
    pub async fn existing_wildcard_overlap_by_name(
        domain: String,
        state: &State,
    ) -> Result<Vec<Domain>, Error> {
        // require that the domain starts with `*.`
        if !domain.starts_with("*.") {
            return Err(Error::RowNotFound);
        }
        let domain = domain[2..].to_string();

        let domains = sqlx::query_as!(
            Domain,
            "SELECT * FROM domains WHERE domain = $1 OR domain LIKE '%.' || $2",
            format!("*.{}", domain),
            domain
        )
        .fetch_all(&state.database.pool)
        .await?;

        Ok(domains)
    }

    /// Checks what wildcard domains overlap with this entry (aka would need be replaced by this domain) (upwards)
    /// 
    /// Given `hello.world.luc.computer` it will spot domains like `['*.world.luc.computer', '*.luc.computer', '*.computer']`
    /// 
    /// This function takes both `luc.computer` and `*.luc.computer` as input
    pub async fn overlap_upwards_wildcard(domain: String, state: &State) -> Result<Vec<Domain>, Error> {
        let domain = domain[2..].to_string();

        let domains = sqlx::query_as!(
            Domain,
            "SELECT * FROM domains WHERE domain LIKE '*.%' AND $1 LIKE REPLACE(domain, '*.', '%.');",
            domain
        )
        .fetch_all(&state.database.pool)
        .await?;

        Ok(domains)
    }
}

#[derive(
    Debug, Clone, PartialEq, Eq, PartialOrd, Ord, Hash, Serialize, Deserialize, FromRow, Object,
)]
pub struct DomainPending {
    pub site_id: String,
    pub domain: String,
    pub challenge: String,
    pub status: String,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

impl DomainPending {
    pub async fn create(
        site_id: String,
        domain: String,
        state: &State,
    ) -> Result<DomainPending, Error> {
        let challenge = uuid::Uuid::new_v4().to_string();
        let status = "pending".to_string();

        let domain_pending = sqlx::query_as!(
            DomainPending,
            "INSERT INTO domains_pending (site_id, domain, challenge, status) VALUES ($1, $2, $3, $4) RETURNING *",
            site_id,
            domain,
            challenge,
            status
        )
        .fetch_one(&state.database.pool)
        .await?;

        Ok(domain_pending)
    }

    pub async fn get_by_site_id_and_domain(
        site_id: String,
        domain: String,
        state: &State,
    ) -> Result<DomainPending, Error> {
        let domain_pending = sqlx::query_as!(
            DomainPending,
            "SELECT * FROM domains_pending WHERE site_id = $1 AND domain = $2",
            site_id,
            domain
        )
        .fetch_one(&state.database.pool)
        .await?;

        Ok(domain_pending)
    }

    pub async fn do_challenge(&self, state: &State) -> Result<(), Error> {
        // get the dns txt record `_edgeserver-challenge` and if its equal to the challenge, update the status to verified

        // if a site exists for this domain delete it and generate a challenge in its place
        let existing_domain = Domain::existing_domain_by_name(self.domain.clone(), state).await;

        if existing_domain.is_ok() {
            let domain = sqlx::query_as!(
                Domain,
                "DELETE FROM domains WHERE domain = $1 RETURNING *",
                self.domain
            )
            .fetch_one(&state.database.pool)
            .await?;

            DomainPending::create(domain.site_id, domain.domain, state).await?;

            info!("Updated the superseded domain and created a new challenge for it");
        }

        sqlx::query!(
            "UPDATE domains_pending SET status = 'pending' WHERE site_id = $1 AND domain = $2",
            self.site_id,
            self.domain
        )
        .execute(&state.database.pool)
        .await?;

        // mark this domainpending as verified and create a new domain in its place
        let domain =
            Domain::create_for_site(self.site_id.clone(), self.domain.clone(), state).await?;

        Ok(())
    }
}

#[derive(Debug, Clone, PartialEq, Eq, PartialOrd, Ord, Hash, Serialize, Deserialize, Union)]
pub enum DomainSubmission {
    Pending(DomainPending),
    Verified(Domain),
}

impl From<DomainPending> for DomainSubmission {
    fn from(pending: DomainPending) -> Self {
        DomainSubmission::Pending(pending)
    }
}

impl From<Domain> for DomainSubmission {
    fn from(domain: Domain) -> Self {
        DomainSubmission::Verified(domain)
    }
}
