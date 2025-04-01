use chrono::{DateTime, Utc};
use opentelemetry::Context;
use poem_openapi::Object;
use serde::{Deserialize, Serialize};
use sqlx::{query, query_as, query_scalar};
use tracing_opentelemetry::OpenTelemetrySpanExt;

use crate::{
    database::Database,
    middlewares::auth::AccessibleResource,
    models::deployment::Deployment,
    routes::error::HttpError,
    state::State,
    utils::id::{generate_id, IdType},
};

use tracing::info_span;

#[derive(Debug, Serialize, Deserialize, Object)]
pub struct Site {
    pub site_id: String,
    pub team_id: String,
    pub name: String,
    pub created_at: DateTime<Utc>,
}

impl Site {
    pub async fn new(
        db: &Database,
        name: impl AsRef<str>,
        team_id: impl AsRef<str>,
    ) -> Result<Self, sqlx::Error> {
        let span = info_span!("Site::new");
        span.set_parent(Context::current());
        let _guard = span.enter();

        let site_id = generate_id(IdType::SITE);

        query_as!(
            Site,
            "INSERT INTO sites (site_id, team_id, name) VALUES ($1, $2, $3) RETURNING *",
            site_id,
            team_id.as_ref(),
            name.as_ref()
        )
        .fetch_one(&db.pool)
        .await
    }

    pub async fn get_by_id(db: &Database, site_id: impl AsRef<str>) -> Result<Self, sqlx::Error> {
        let span = info_span!("Site::get_by_id");
        span.set_parent(Context::current());
        let _guard = span.enter();

        query_as!(
            Site,
            "SELECT * FROM sites WHERE site_id = $1",
            site_id.as_ref()
        )
        .fetch_one(&db.pool)
        .await
    }

    pub async fn get_by_team_id(
        db: &Database,
        team_id: impl AsRef<str>,
    ) -> Result<Vec<Self>, sqlx::Error> {
        let span = info_span!("Site::get_by_team_id");
        span.set_parent(Context::current());
        let _guard = span.enter();

        query_as!(
            Site,
            "SELECT * FROM sites WHERE team_id = $1",
            team_id.as_ref()
        )
        .fetch_all(&db.pool)
        .await
    }

    // Sites where the user is a member of the team (through being the owner_id or in user_teams)
    pub async fn get_by_user_id(
        db: &Database,
        user_id: impl AsRef<str>,
    ) -> Result<Vec<Self>, sqlx::Error> {
        let span = info_span!("Site::get_by_user_id");
        span.set_parent(Context::current());
        let _guard = span.enter();

        query_as!(
            Site,
            "SELECT * FROM sites WHERE team_id IN (SELECT team_id FROM user_teams WHERE user_id = $1) OR team_id IN (SELECT team_id FROM teams WHERE owner_id = $1)",
            user_id.as_ref()
        )
        .fetch_all(&db.pool)
        .await
    }

    pub async fn get_deployments(
        db: &Database,
        site_id: impl AsRef<str>,
    ) -> Result<Vec<Deployment>, sqlx::Error> {
        let span = info_span!("Site::get_deployments");
        span.set_parent(Context::current());
        let _guard = span.enter();

        query_as!(
            Deployment,
            "SELECT * FROM deployments WHERE site_id = $1 ORDER BY created_at DESC",
            site_id.as_ref()
        )
        .fetch_all(&db.pool)
        .await
    }

    pub async fn update_team(
        db: &Database,
        site_id: impl AsRef<str>,
        team_id: impl AsRef<str>,
    ) -> Result<(), sqlx::Error> {
        let span = info_span!("Site::update_team");
        span.set_parent(Context::current());
        let _guard = span.enter();

        query!(
            "UPDATE sites SET team_id = $1 WHERE site_id = $2",
            team_id.as_ref(),
            site_id.as_ref()
        )
        .execute(&db.pool)
        .await
        .map(|_| ())
    }
}
#[derive(Debug)]
pub struct SiteId<'a>(pub &'a str);

impl<'a> AccessibleResource for SiteId<'a> {
    #[tracing::instrument(name = "has_access", skip(state))]
    async fn has_access(
        &self,
        state: &State,
        resource: &str,
        resource_id: &str,
    ) -> Result<bool, HttpError> {
        let cache_key = format!("site:{}", self.0);

        let part_of_site = state.cache.raw.get_with(cache_key, async {
            if resource == "user" {
                // Verify that the user is a member of the team that owns the site
                let part_of_site = query_scalar!(
                    "SELECT EXISTS (SELECT 1 FROM sites WHERE site_id = $1 AND team_id IN (SELECT team_id FROM user_teams WHERE user_id = $2) OR team_id IN (SELECT team_id FROM teams WHERE owner_id = $2))",
                    self.0,
                    resource_id
                )
                .fetch_one(&state.database.pool)
                .await;

                let part_of_site = part_of_site.ok().flatten().unwrap_or(false);

                serde_json::to_value(part_of_site).unwrap()
            } else if resource == "site" {
                if self.0 == resource_id {
                    serde_json::to_value(true).unwrap()
                } else {
                    serde_json::to_value(false).unwrap()
                }
            } else if resource == "team" {
                let site = Site::get_by_id(&state.database, resource_id).await.map_err(HttpError::from).ok();

                let site_has_access = site
                    .map(|s| s.team_id == resource_id)
                    .unwrap_or(false);

                serde_json::to_value(site_has_access).unwrap()
            } else {
                serde_json::to_value(false).unwrap()
            }
        }).await;

        let part_of_site: bool = serde_json::from_value(part_of_site).unwrap_or_default();

        Ok(part_of_site)
    }
}
