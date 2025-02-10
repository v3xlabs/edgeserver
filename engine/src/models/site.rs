use chrono::{DateTime, Utc};
use poem_openapi::Object;
use serde::{Deserialize, Serialize};
use sqlx::{query_as, query_scalar};

use crate::{database::Database, middlewares::auth::AccessibleResource, models::deployment::Deployment, routes::error::HttpError, state::State, utils::id::{generate_id, IdType}};

#[derive(Debug, Serialize, Deserialize, Object)]
pub struct Site {
    pub site_id: String,
    pub team_id: String,
    pub name: String,
    pub created_at: DateTime<Utc>,
}

impl Site {
    pub async fn new(db: &Database, name: impl AsRef<str>, team_id: impl AsRef<str>) -> Result<Self, sqlx::Error> {
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
        query_as!(
            Site,
            "SELECT * FROM sites WHERE site_id = $1",
            site_id.as_ref()
        )
        .fetch_one(&db.pool)
        .await
    }

    pub async fn get_by_team_id(db: &Database, team_id: impl AsRef<str>) -> Result<Vec<Self>, sqlx::Error> {
        query_as!(
            Site,
            "SELECT * FROM sites WHERE team_id = $1",
            team_id.as_ref()
        )
        .fetch_all(&db.pool)
        .await
    }

    // Sites where the user is a member of the team (through being the owner_id or in user_teams)
    pub async fn get_by_user_id(db: &Database, user_id: impl AsRef<str>) -> Result<Vec<Self>, sqlx::Error> {
        query_as!(
            Site,
            "SELECT * FROM sites WHERE team_id IN (SELECT team_id FROM user_teams WHERE user_id = $1) OR team_id IN (SELECT team_id FROM teams WHERE owner_id = $1)",
            user_id.as_ref()
        )
        .fetch_all(&db.pool)
        .await
    }

    pub async fn get_deployments(db: &Database, site_id: impl AsRef<str>) -> Result<Vec<Deployment>, sqlx::Error> {
        query_as!(
            Deployment,
            "SELECT * FROM deployments WHERE site_id = $1 ORDER BY created_at DESC",
            site_id.as_ref()
        )
        .fetch_all(&db.pool)
        .await
    }
}

pub struct SiteId<'a>(pub &'a str);

impl<'a> AccessibleResource for SiteId<'a> {
    async fn has_access_to(&self, state: &State, user_id: &str) -> Result<bool, HttpError> {
        // Verify that the user is a member of the team that owns the site
        let part_of_site = query_scalar!(
            "SELECT EXISTS (SELECT 1 FROM sites WHERE site_id = $1 AND team_id IN (SELECT team_id FROM user_teams WHERE user_id = $2) OR team_id IN (SELECT team_id FROM teams WHERE owner_id = $2))",
            self.0,
            user_id
        )
        .fetch_one(&state.database.pool)
        .await
        .map_err(HttpError::from)?;

        let part_of_site = part_of_site.unwrap_or(false);

        Ok(part_of_site)
    }
}
