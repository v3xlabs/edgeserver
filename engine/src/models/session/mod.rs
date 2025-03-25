use std::net::IpAddr;

use chrono::{DateTime, Utc};
use poem_openapi::Object;
use serde::{Deserialize, Serialize};
use sqlx::query_as;
use tracing::Instrument;

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

    pub async fn get_by_id(db: &Database, session_id: &str) -> Result<Option<Self>, sqlx::Error> {
        let session_id = session_id.to_string();
        let db = db.clone();
        
        let get_session = async move {
            let session = query_as!(Session, "SELECT * FROM sessions WHERE session_id = $1", session_id)
                .fetch_optional(&db.pool)
                .await?;

            Ok(session)
        };
        
        tracing::Instrument::instrument(
            get_session,
            tracing::info_span!("get_session_by_id")
        ).await
    }

    pub async fn try_access(db: &Database, session_id: &str) -> Result<Option<Self>, sqlx::Error> {
        let session_id = session_id.to_string();
        let db = db.clone();
        
        let try_access = async move {
            let session = query_as!(
                Session,
                "UPDATE sessions SET updated_at = NOW() WHERE session_id = $1 AND valid = TRUE RETURNING *",
                session_id
            )
            .fetch_optional(&db.pool)
            .await?;

            Ok(session)
        };
        
        tracing::Instrument::instrument(
            try_access,
            tracing::info_span!("try_access")
        ).await
    }

    /// Get all sessions for a user that are valid
    pub async fn get_by_user_id(db: &Database, user_id: &str) -> Result<Vec<Self>, sqlx::Error> {
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
        let state = state.clone();
        let user_id = self.user_id.clone();
        
        let verify_access = async move {
            resource
                .has_access_to(&state, &user_id)
                .await
                .map_err(HttpError::from)?;
            Ok(())
        };
        
        tracing::Instrument::instrument(
            verify_access,
            tracing::info_span!("session_verify_access")
        ).await
    }
}
