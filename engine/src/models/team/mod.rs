use chrono::{DateTime, Utc};
use poem_openapi::Object;
use serde::{Deserialize, Serialize};
use sqlx::{query, query_as, query_scalar};

use crate::{
    database::Database, middlewares::auth::AccessibleResource, models::user::User, routes::error::HttpError, state::State, utils::id::{generate_id, IdType}
};

pub mod invite;

#[derive(Debug, Serialize, Deserialize, Object)]
pub struct Team {
    pub team_id: String,
    pub owner_id: String,
    pub name: String,
    pub created_at: DateTime<Utc>,
}

impl Team {
    pub async fn new(
        db: &Database,
        name: impl AsRef<str>,
        owner_id: impl AsRef<str>,
    ) -> Result<Self, sqlx::Error> {
        let team_id = generate_id(IdType::TEAM);

        query_as!(
            Team,
            "INSERT INTO teams (team_id, name, owner_id) VALUES ($1, $2, $3) RETURNING *",
            team_id,
            name.as_ref(),
            owner_id.as_ref()
        )
        .fetch_one(&db.pool)
        .await
    }

    pub async fn get_by_id(db: &Database, team_id: impl AsRef<str>) -> Result<Self, sqlx::Error> {
        query_as!(
            Team,
            "SELECT * FROM teams WHERE team_id = $1",
            team_id.as_ref()
        )
        .fetch_one(&db.pool)
        .await
    }

    pub async fn get_by_user_id(
        db: &Database,
        user_id: impl AsRef<str>,
    ) -> Result<Vec<Self>, sqlx::Error> {
        // query for teams where the user_id is the team owner_id,
        // also include teams where the user_id is in the user_teams table
        query_as!(
            Team,
            "SELECT * FROM teams WHERE owner_id = $1 OR team_id IN (SELECT team_id FROM user_teams WHERE user_id = $1)",
            user_id.as_ref()
        )
        .fetch_all(&db.pool)
        .await
    }

    pub async fn delete_by_id(
        db: &Database,
        team_id: impl AsRef<str>,
    ) -> Result<(), sqlx::Error> {
        query!(
            "DELETE FROM teams WHERE team_id = $1",
            team_id.as_ref()
        )
        .execute(&db.pool)
        .await?;

        Ok(())
    }

    pub async fn is_owner(
        db: &Database,
        team_id: impl AsRef<str>,
        user_id: impl AsRef<str>,
    ) -> Result<bool, sqlx::Error> {
        Ok(query_as!(
            Team,
            "SELECT * FROM teams WHERE team_id = $1 AND owner_id = $2",
            team_id.as_ref(),
            user_id.as_ref()
        )
        .fetch_optional(&db.pool)
        .await?
        .is_some())
    }

    pub async fn is_member(
        db: &Database,
        team_id: impl AsRef<str>,
        user_id: impl AsRef<str>,
    ) -> Result<bool, sqlx::Error> {
        Ok(query_scalar!(
            "SELECT EXISTS (SELECT 1 FROM user_teams WHERE team_id = $1 AND user_id = $2) OR EXISTS (SELECT 1 FROM teams WHERE team_id = $1 AND owner_id = $2)",
            team_id.as_ref(),
            user_id.as_ref()
        )
        .fetch_one(&db.pool)
        .await?
        .unwrap_or(false))
    }

    pub async fn get_members(
        db: &Database,
        team_id: impl AsRef<str>,
    ) -> Result<Vec<User>, sqlx::Error> {
        query_as!(
            User,
            "SELECT * FROM users WHERE user_id IN (SELECT user_id FROM user_teams WHERE team_id = $1) OR user_id = (SELECT owner_id FROM teams WHERE team_id = $1)",
            team_id.as_ref()
        )
        .fetch_all(&db.pool)
        .await
    }
}

pub struct TeamId<'a>(pub &'a str);

impl<'a> AccessibleResource for TeamId<'a> {
    async fn has_access_to(&self, state: &State, user_id: &str) -> Result<bool, HttpError> {
        let x = Team::is_member(&state.database, self.0, user_id).await.map_err(HttpError::from)?;  

        Ok(x)
    }
}
