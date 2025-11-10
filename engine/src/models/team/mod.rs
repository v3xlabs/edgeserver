use std::fmt::Debug;

use chrono::{DateTime, Utc};
use opentelemetry::Context;
use poem_openapi::Object;
use serde::{Deserialize, Serialize};
use sqlx::{query, query_as, query_scalar};
use tracing::{info_span, Instrument};
use tracing_opentelemetry::OpenTelemetrySpanExt;

use crate::{
    database::Database,
    middlewares::auth::AccessibleResource,
    models::user::User,
    routes::error::HttpError,
    state::State,
    utils::id::{generate_id, IdType},
};

pub mod invite;

#[derive(Debug, Serialize, Deserialize, Object)]
pub struct Team {
    pub team_id: String,
    pub owner_id: String,
    pub name: String,
    pub avatar_url: Option<String>,
    pub created_at: DateTime<Utc>,
}

impl Team {
    pub async fn new(
        db: &Database,
        name: impl AsRef<str>,
        owner_id: impl AsRef<str>,
    ) -> Result<Self, sqlx::Error> {
        let span = info_span!("Team::new");
        async move {
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
        .instrument(span)
        .await
    }

    #[tracing::instrument(name = "get_by_id", skip(db))]
    pub async fn get_by_id(
        db: &Database,
        team_id: impl AsRef<str> + Debug,
    ) -> Result<Self, sqlx::Error> {
        let span = info_span!("Team::get_by_id");
        async move {
            query_as!(
                Team,
                "SELECT * FROM teams WHERE team_id = $1",
                team_id.as_ref()
            )
            .fetch_one(&db.pool)
            .await
        }
        .instrument(span)
        .await
    }

    #[tracing::instrument(name = "get_by_user_id", skip(db))]
    pub async fn get_by_user_id(
        db: &Database,
        user_id: impl AsRef<str> + Debug,
    ) -> Result<Vec<Self>, sqlx::Error> {
        let span = info_span!("Team::get_by_user_id");
        async move {
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
        .instrument(span)
        .await
    }

    #[tracing::instrument(name = "delete_by_id", skip(db))]
    pub async fn delete_by_id(db: &Database, team_id: impl AsRef<str> + Debug) -> Result<(), sqlx::Error> {
        let span = info_span!("Team::delete_by_id");
        async move {
            query!("DELETE FROM teams WHERE team_id = $1", team_id.as_ref())
                .execute(&db.pool)
                .await?;

            Ok(())
        }
        .instrument(span)
        .await
    }

    #[tracing::instrument(name = "is_owner", skip(db))]
    pub async fn is_owner(
        db: &Database,
        team_id: impl AsRef<str> + Debug,
        user_id: impl AsRef<str> + Debug,
    ) -> Result<bool, sqlx::Error> {
        let span = info_span!("Team::is_owner");
        async move {
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
        .instrument(span)
        .await
    }

    #[tracing::instrument(name = "is_member", skip(state))]
    pub async fn is_member(
        state: &State,
        team_id: impl AsRef<str> + Debug,
        user_id: impl AsRef<str> + Debug,
    ) -> Result<bool, sqlx::Error> {
        let cache_key = format!("team:{}:member:{}", team_id.as_ref(), user_id.as_ref());

        let is_member = state
            .cache
            .raw
            .get_with(cache_key.clone(), async {
                let member = Team::_is_member(state.clone(), team_id, user_id)
                    .await
                    .ok()
                    .unwrap_or(false);

                serde_json::Value::from(member)
            })
            .await;

        let is_member: bool = serde_json::from_value(is_member).unwrap_or(false);

        Ok(is_member)
    }

    #[tracing::instrument(name = "_is_member", skip(state))]
    async fn _is_member(
        state: State,
        team_id: impl AsRef<str> + Debug,
        user_id: impl AsRef<str> + Debug,
    ) -> Result<bool, sqlx::Error> {
        let span = info_span!("Team::_is_member");
        async move {
            query_scalar!(
                "SELECT EXISTS (SELECT 1 FROM user_teams WHERE team_id = $1 AND user_id = $2) OR EXISTS (SELECT 1 FROM teams WHERE team_id = $1 AND owner_id = $2)",
                team_id.as_ref(),
                user_id.as_ref()
            )
            .fetch_one(&state.database.pool)
            .await
            .map(|x| x.unwrap_or(false))
        }
        .instrument(span)
        .await
    }

    #[tracing::instrument(name = "get_members", skip(db))]
    pub async fn get_members(
        db: &Database,
        team_id: impl AsRef<str> + Debug,
    ) -> Result<Vec<User>, sqlx::Error> {
        let span = info_span!("Team::get_members");
        async move {
            query_as!(
                User,
                "SELECT * FROM users WHERE user_id IN (SELECT user_id FROM user_teams WHERE team_id = $1) OR user_id = (SELECT owner_id FROM teams WHERE team_id = $1)",
                team_id.as_ref()
            )
            .fetch_all(&db.pool)
            .await
        }
        .instrument(span)
        .await
    }

    pub async fn add_member(
        db: &Database,
        team_id: impl AsRef<str>,
        user_id: impl AsRef<str>,
    ) -> Result<(), sqlx::Error> {
        let span = info_span!("Team::add_member");
        async move {
            query!(
                "INSERT INTO user_teams (team_id, user_id) VALUES ($1, $2)",
                team_id.as_ref(),
                user_id.as_ref()
            )
            .execute(&db.pool)
            .await?;

            Ok(())
        }
        .instrument(span)
        .await
    }

    pub async fn update_name(
        db: &Database,
        team_id: impl AsRef<str>,
        name: impl AsRef<str>,
    ) -> Result<(), sqlx::Error> {
        let span = info_span!("Team::update_name");
        async move {
            query!(
                "UPDATE teams SET name = $2 WHERE team_id = $1",
                team_id.as_ref(),
                name.as_ref()
            )
            .execute(&db.pool)
            .await?;

            Ok(())
        }
        .instrument(span)
        .await
    }

    pub async fn update_avatar(
        db: &Database,
        team_id: impl AsRef<str>,
        avatar_url: impl AsRef<str>,
    ) -> Result<Team, sqlx::Error> {
        let span = info_span!("Team::update_avatar");
        async move {
            query_as!(
                Team,
                "UPDATE teams SET avatar_url = $2 WHERE team_id = $1 RETURNING *",
                team_id.as_ref(),
                avatar_url.as_ref()
            )
            .fetch_one(&db.pool)
            .await
        }
        .instrument(span)
        .await
    }
}

#[derive(Debug)]
pub struct TeamId<'a>(pub &'a str);

impl<'a> AccessibleResource for TeamId<'a> {
    async fn has_access(
        &self,
        state: &State,
        resource: &str,
        resource_id: &str,
    ) -> Result<bool, HttpError> {
        if resource == "user" {
            let x = Team::is_member(&state, self.0, resource_id)
                .await
                .map_err(HttpError::from)?;

            Ok(x)
        } else if resource == "team" {
            if self.0 == resource_id {
                Ok(true)
            } else {
                Ok(false)
            }
        } else {
            Ok(false)
        }
    }
}
