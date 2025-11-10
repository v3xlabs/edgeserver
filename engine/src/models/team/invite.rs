use chrono::{DateTime, Utc};
use opentelemetry::Context;
use poem_openapi::Object;
use serde::{Deserialize, Serialize};
use tracing::{info_span, Instrument};
use tracing_opentelemetry::OpenTelemetrySpanExt;

use crate::{
    database::Database,
    utils::id::{generate_id, IdType},
};

#[derive(Debug, Serialize, Deserialize, Object)]
pub struct UserTeamInvite {
    pub invite_id: String,
    pub team_id: String,
    pub user_id: Option<String>,
    pub status: String, // pending, accepted, rejected
    pub created_at: DateTime<Utc>,
    pub accepted_at: Option<DateTime<Utc>>,
    pub sender_id: String,
}

impl UserTeamInvite {
    pub async fn new(
        db: &Database,
        team_id: impl AsRef<str>,
        user_id: Option<impl AsRef<str>>,
        sender_id: impl AsRef<str>,
    ) -> Result<Self, sqlx::Error> {
        let span = info_span!("UserTeamInvite::new");
        async move {
            let invite_id = generate_id(IdType::TEAM_INVITE);

            sqlx::query_as!(
                UserTeamInvite,
                "INSERT INTO user_team_invites (invite_id, team_id, user_id, sender_id) VALUES ($1, $2, $3, $4) RETURNING *",
                invite_id,
                team_id.as_ref(),
                user_id.as_ref().map(|s| s.as_ref()),
                sender_id.as_ref()
            )
            .fetch_one(&db.pool)
            .await
        }
        .instrument(span)
        .await
    }

    pub async fn get_by_invite_id(
        db: &Database,
        invite_id: impl AsRef<str>,
    ) -> Result<Self, sqlx::Error> {
        let span = info_span!("UserTeamInvite::get_by_invite_id");
        async move {
            sqlx::query_as!(
                UserTeamInvite,
                "SELECT * FROM user_team_invites WHERE invite_id = $1",
                invite_id.as_ref()
            )
            .fetch_one(&db.pool)
            .await
        }
        .instrument(span)
        .await
    }

    pub async fn get_by_team_id(
        db: &Database,
        team_id: impl AsRef<str>,
    ) -> Result<Vec<Self>, sqlx::Error> {
        let span = info_span!("UserTeamInvite::get_by_team_id");
        async move {
            sqlx::query_as!(
                UserTeamInvite,
                "SELECT * FROM user_team_invites WHERE team_id = $1",
                team_id.as_ref()
            )
            .fetch_all(&db.pool)
            .await
        }
        .instrument(span)
        .await
    }

    pub async fn get_by_team_and_user(
        db: &Database,
        team_id: impl AsRef<str>,
        user_id: impl AsRef<str>,
    ) -> Result<Self, sqlx::Error> {
        let span = info_span!("UserTeamInvite::get_by_team_and_user");
        async move {
            sqlx::query_as!(
                UserTeamInvite,
                "SELECT * FROM user_team_invites WHERE team_id = $1 AND user_id = $2",
                team_id.as_ref(),
                user_id.as_ref()
            )
            .fetch_one(&db.pool)
            .await
        }
        .instrument(span)
        .await
    }

    pub async fn delete_by_id(
        db: &Database,
        invite_id: impl AsRef<str>,
    ) -> Result<(), sqlx::Error> {
        let span = info_span!("UserTeamInvite::delete_by_id");
        async move {
            sqlx::query!(
                "DELETE FROM user_team_invites WHERE invite_id = $1",
                invite_id.as_ref()
            )
            .execute(&db.pool)
            .await?;

            Ok(())
        }
        .instrument(span)
        .await
    }

    pub async fn accept_invite(
        db: &Database,
        invite_id: impl AsRef<str>,
        user_id: impl AsRef<str>,
    ) -> Result<(), sqlx::Error> {
        let span = info_span!("UserTeamInvite::accept_invite");
        async move {
            // Mark invite as accepted and mark user as a member of the team
            sqlx::query!(
                "UPDATE user_team_invites SET status = 'accepted', user_id = $2, accepted_at = NOW() WHERE invite_id = $1",
                invite_id.as_ref(),
                user_id.as_ref()
            )
            .execute(&db.pool)
            .await?;

            Ok(())
        }
        .instrument(span)
        .await
    }
}
