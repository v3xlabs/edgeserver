use chrono::{DateTime, Utc};
use poem_openapi::{Object, Union};
use serde::{Deserialize, Serialize};
use sqlx::{Error, FromRow};
use tracing::{info, info_span};

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
    pub async fn get_soft_overlap(
        domain: &str,
        state: &State,
    ) -> Result<Vec<Domain>, Error> {
        let span = info_span!("Domain::get_soft_overlap");
        let _guard = span.enter();

        let overlap = if domain.starts_with("*.") {
            Domain::existing_wildcard_overlap_by_name(domain, state).await?
        } else {
            Domain::existing_domain_by_name(domain, state)
                .await?
                .map(|x| vec![x])
                .unwrap_or_default()
        };

        Ok(overlap)
    }

    pub async fn get_hard_overlap(
        domain: &str,
        state: &State,
    ) -> Result<Vec<Domain>, Error> {
        let overlap = Domain::overlap_upwards_wildcard(domain.clone(), state).await?;
        Ok(overlap)
    }

    pub async fn get_by_site_id(
        site_id: &str,
        state: &State,
    ) -> Result<Vec<DomainSubmission>, Error> {
        let span = info_span!("Domain::get_by_site_id");
        let _guard = span.enter();

        let mut domains: Vec<Domain> =
            sqlx::query_as!(Domain, "SELECT * FROM domains WHERE site_id = $1", site_id)
                .fetch_all(&state.database.pool)
                .await?;

        domains.sort_by(|a, b| sort_domains_by_reversed_parts(&a.domain, &b.domain));

        let mut pending_domains: Vec<DomainPending> = sqlx::query_as!(
            DomainPending,
            "SELECT * FROM domains_pending WHERE site_id = $1",
            site_id
        )
        .fetch_all(&state.database.pool)
        .await?;

        pending_domains.sort_by(|a, b| sort_domains_by_reversed_parts(&a.domain, &b.domain));

        Ok(domains
            .into_iter()
            .map(|domain| domain.into())
            .chain(pending_domains.into_iter().map(|pending| pending.into()))
            .collect())
    }

    pub async fn get_by_site_id_and_domain(
        site_id: &str,
        domain: &str,
        state: &State,
    ) -> Result<Option<Domain>, Error> {
        let span = info_span!("Domain::get_by_site_id_and_domain");
        let _guard = span.enter();

        let domain = sqlx::query_as!(
            Domain,
            "SELECT * FROM domains WHERE site_id = $1 AND domain = $2",
            site_id,
            domain
        )
        .fetch_optional(&state.database.pool)
        .await?;

        Ok(domain)
    }

    pub async fn delete_by_site_id_and_domain(
        site_id: &str,
        domain: &str,
        state: &State,
    ) -> Result<(), Error> {
        let span = info_span!("Domain::delete_by_site_id_and_domain");
        let _guard = span.enter();

        sqlx::query!(
            "DELETE FROM domains WHERE site_id = $1 AND domain = $2",
            site_id,
            domain
        )
        .execute(&state.database.pool)
        .await?;

        Ok(())
    }

    pub async fn create_for_site(
        site_id: &str,
        domain: &str,
        state: &State,
    ) -> Result<DomainSubmission, Error> {
        let span = info_span!("Domain::create_for_site");
        let _guard = span.enter();

        // check if domain exist by name, the domains from initial overlap are to be overwritten if this gets validated
        let mut overlap = Domain::get_soft_overlap(domain, state).await?;

        // reverse overlap (any domains that might overlap with this domain)
        // these domains wont get overwritten if this gets validated, however will be out-prioritized
        overlap.extend(Domain::overlap_upwards_wildcard(domain.clone(), state).await?);

        // remove duplicates
        overlap.sort_by_key(|x| x.domain.clone());
        overlap.dedup_by_key(|x| x.domain.clone());

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
                    &existing_domain.site_id,
                    &existing_domain.domain,
                    state,
                )
                .await?;

                if let Some(domain_pending) = domain_pending_exists {
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

    pub async fn create_for_site_superceded(
        site_id: &str,
        domain: &str,
        state: &State,
    ) -> Result<Domain, Error> {
        let span = info_span!("Domain::create_for_site_superceded");
        let _guard = span.enter();

        let domain = sqlx::query_as!(Domain, "INSERT INTO domains (site_id, domain) VALUES ($1, $2) RETURNING *", site_id, domain)
            .fetch_one(&state.database.pool)
            .await?;

        Ok(domain)
    }

    pub async fn existing_domain_by_name(
        domain: &str,
        state: &State,
    ) -> Result<Option<Domain>, Error> {
        let span = info_span!("Domain::existing_domain_by_name");
        let _guard = span.enter();

        let domain = sqlx::query_as!(Domain, "SELECT * FROM domains WHERE domain = $1", domain)
            .fetch_optional(&state.database.pool)
            .await?;

        Ok(domain)
    }

    /// Given a wildcard domain `*.luc.computer` it will return all downwards overlapping domains
    ///
    /// Given `*.luc.computer` it will return `['hello.world.luc.computer', '*.dev.luc.computer', '*.computer']`
    pub async fn existing_wildcard_overlap_by_name(
        domain: &str,
        state: &State,
    ) -> Result<Vec<Domain>, Error> {
        let span = info_span!("Domain::existing_wildcard_overlap_by_name");
        let _guard = span.enter();

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
    pub async fn overlap_upwards_wildcard(
        domain: &str,
        state: &State,
    ) -> Result<Vec<Domain>, Error> {
        let span = info_span!("Domain::overlap_upwards_wildcard");
        let _guard = span.enter();

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
        site_id: &str,
        domain: &str,
        state: &State,
    ) -> Result<DomainPending, Error> {
        let span = info_span!("DomainPending::create");
        let _guard = span.enter();

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
        site_id: &str,
        domain: &str,
        state: &State,
    ) -> Result<Option<DomainPending>, Error> {
        let span = info_span!("DomainPending::get_by_site_id_and_domain");
        let _guard = span.enter();

        let domain_pending = sqlx::query_as!(
            DomainPending,
            "SELECT * FROM domains_pending WHERE site_id = $1 AND domain = $2",
            site_id,
            domain
        )
        .fetch_optional(&state.database.pool)
        .await?;

        Ok(domain_pending)
    }

    pub async fn delete_by_site_id_and_domain(
        site_id: &str,
        domain: &str,
        state: &State,
    ) -> Result<(), Error> {
        let span = info_span!("DomainPending::delete_by_site_id_and_domain");
        let _guard = span.enter();

        sqlx::query!(
            "DELETE FROM domains_pending WHERE site_id = $1 AND domain = $2",
            site_id,
            domain
        )
        .execute(&state.database.pool)
        .await?;

        Ok(())
    }
    pub async fn do_challenge(&self, state: &State) -> Result<(), Error> {
        let span = info_span!("DomainPending::do_challenge");
        let _guard = span.enter();

        // get the dns txt record `_edgeserver-challenge` and if its equal to the challenge, update the status to verified

        // if a site exists for this domain delete it and generate a challenge in its place
        let existing_domain = Domain::existing_domain_by_name(&self.domain, state).await;

        if existing_domain.is_ok() {
            let domain = sqlx::query_as!(
                Domain,
                "DELETE FROM domains WHERE domain = $1 RETURNING *",
                self.domain
            )
            .fetch_one(&state.database.pool)
            .await?;

            DomainPending::create(&domain.site_id, &domain.domain, state).await?;

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
        let _domain =
            Domain::create_for_site(&self.site_id, &self.domain, state).await?;

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

impl DomainSubmission {
    pub fn domain(&self) -> String {
        match self {
            DomainSubmission::Pending(pending) => pending.domain.clone(),
            DomainSubmission::Verified(domain) => domain.domain.clone(),
        }
    }
}
/// Sorts domains in reverse order (TLD first), with "*" treated as coming last
fn sort_domains_by_reversed_parts(a: &str, b: &str) -> std::cmp::Ordering {
    // Split domains by dots and reverse the parts
    let a_parts: Vec<&str> = a.split('.').collect::<Vec<&str>>().into_iter().rev().collect();
    let b_parts: Vec<&str> = b.split('.').collect::<Vec<&str>>().into_iter().rev().collect();
    
    // Compare parts one by one
    for i in 0..std::cmp::min(a_parts.len(), b_parts.len()) {
        let a_part = a_parts[i];
        let b_part = b_parts[i];
        
        // Special handling for "*"
        if a_part == "*" && b_part != "*" {
            return std::cmp::Ordering::Greater;
        } else if a_part != "*" && b_part == "*" {
            return std::cmp::Ordering::Less;
        }
        
        // Normal string comparison if neither is "*"
        let part_cmp = a_part.cmp(b_part);
        if part_cmp != std::cmp::Ordering::Equal {
            return part_cmp;
        }
    }
    
    // If all compared parts are equal, the shorter domain comes first
    a_parts.len().cmp(&b_parts.len())
}
