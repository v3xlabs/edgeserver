use std::net::IpAddr;

use chrono::{DateTime, Utc};
use opentelemetry_semantic_conventions::attribute;
use poem_openapi::Object;
use serde::{Deserialize, Serialize};
use sqlx::query_as;
use tracing::info_span;
use tracing_opentelemetry::OpenTelemetrySpanExt;

use crate::{
    database::Database,
    middlewares::auth::AccessibleResource,
    routes::error::HttpError,
    state::State,
    utils::{
        hash::hash_session,
        id::{generate_id, IdType},
    },
};

#[derive(sqlx::FromRow, Debug, Clone, Serialize, Deserialize, Object)]
pub struct Session {
    pub session_id: String,
    pub user_id: String,
    pub user_agent: String,
    pub user_ip: String,
    pub valid: bool,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

impl Session {
    pub async fn new(
        db: &Database,
        user_id: &str,
        user_agent: &str,
        user_ip: &IpAddr,
    ) -> Result<(String, Self), sqlx::Error> {
        let token = generate_id(IdType::SESSION);
        let session_id = hash_session(&token);

        let session = query_as!(Session,
            "INSERT INTO sessions (session_id, user_id, user_agent, user_ip) VALUES ($1, $2, $3, $4) RETURNING *",
            session_id, user_id, user_agent, user_ip.to_string()
        )
        .fetch_one(&db.pool)
        .await?;

        Ok((token, session))
    }

    #[tracing::instrument(name = "get_session_by_id", skip(db))]
    pub async fn get_by_id(db: &Database, session_id: &str) -> Result<Option<Self>, sqlx::Error> {
        info_span!("get_by_id", "session" = session_id);
        let session = query_as!(Session, "SELECT * FROM sessions WHERE session_id = $1", session_id)
            .fetch_optional(&db.pool)
            .await?;

        Ok(session)
    }

    #[tracing::instrument(name = "try_access", skip(db))]
    pub async fn try_access(db: &Database, session_id: &str) -> Result<Option<Self>, sqlx::Error> {
        let span = info_span!("try_access", "session" = session_id);
        span.set_attribute(attribute::DB_SYSTEM_NAME, "database");
        let session = query_as!(
            Session,
            "UPDATE sessions SET updated_at = NOW() WHERE session_id = $1 AND valid = TRUE RETURNING *",
            session_id
        )
        .fetch_optional(&db.pool)
        .await?;

        Ok(session)
    }

    /// Get all sessions for a user that are valid
    pub async fn get_by_user_id(db: &Database, user_id: &str) -> Result<Vec<Self>, sqlx::Error> {
        info_span!("get_by_user_id", "user_id" = user_id);
        let sessions = query_as!(
            Session,
            "SELECT * FROM sessions WHERE user_id = $1",
            user_id
        )
        .fetch_all(&db.pool)
        .await?;

        Ok(sessions)
    }

    /// Set every session to invalid
    pub async fn invalidate_by_user_id(
        db: &Database,
        user_id: &str,
    ) -> Result<Vec<Self>, sqlx::Error> {
        info_span!("invalidate_by_user_id", "user_id" = user_id);
        let sessions = query_as!(
            Session,
            "UPDATE sessions SET valid = FALSE WHERE user_id = $1 RETURNING *",
            user_id
        )
        .fetch_all(&db.pool)
        .await?;

        Ok(sessions)
    }

    /// Set session to invalid by id
    pub async fn invalidate_by_id(
        db: &Database,
        user_id: &str,
        session_id: &str,
    ) -> Result<Vec<Self>, sqlx::Error> {
        info_span!("invalidate_by_id", "user_id" = user_id, "session_id" = session_id);
        let sessions = query_as!(
            Session,
            "UPDATE sessions SET valid = FALSE WHERE user_id = $1 AND session_id = $2 RETURNING *",
            user_id,
            session_id
        )
        .fetch_all(&db.pool)
        .await?;

        Ok(sessions)
    }

    /// Invalidate all sessions for a user that are older than the given time
    pub async fn invalidate_by_user_id_by_time(
        db: &Database,
        user_id: &str,
        invalidate_before: DateTime<Utc>,
    ) -> Result<Vec<Self>, sqlx::Error> {
        info_span!("invalidate_by_user_id_by_time", "user_id" = user_id);
            let sessions = query_as!(
            Session,
            "UPDATE sessions SET valid = FALSE WHERE user_id = $1 AND updated_at < $2 RETURNING *",
            user_id,
            invalidate_before
        )
        .fetch_all(&db.pool)
        .await?;

        Ok(sessions)
    }

    pub async fn verify_access_to(
        &self,
        state: &State,
        resource: &impl AccessibleResource,
    ) -> Result<(), HttpError> {
        info_span!("verify_access_to", "user_id" = self.user_id);
        resource
            .has_access(state, "user", &self.user_id)
            .await
            .map_err(HttpError::from)?;
        Ok(())
    }
}
