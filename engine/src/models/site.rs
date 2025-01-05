use chrono::{DateTime, Utc};
use poem_openapi::Object;
use serde::{Deserialize, Serialize};
use sqlx::query_as;

use crate::{database::Database, models::deployment::Deployment, utils::id::{generate_id, IdType}};

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
