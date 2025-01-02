use chrono::{DateTime, Utc};
use poem_openapi::Object;
use serde::{Deserialize, Serialize};

use crate::{
    database::Database,
    utils::id::{generate_id, IdType},
};

#[derive(Debug, Serialize, Deserialize, Object)]
pub struct UserTeamInvite {
    pub invite_id: String,
    pub team_id: String,
    pub user_id: String,
    pub created_at: DateTime<Utc>,
}

impl UserTeamInvite {
    pub async fn new(
        db: &Database,
        team_id: impl AsRef<str>,
        user_id: impl AsRef<str>,
    ) -> Result<Self, sqlx::Error> {
        let invite_id = generate_id(IdType::TEAM_INVITE);

        sqlx::query_as!(
            UserTeamInvite,
            "INSERT INTO user_team_invites (invite_id, team_id, user_id) VALUES ($1, $2, $3) RETURNING *",
            invite_id,
            team_id.as_ref(),
            user_id.as_ref()
        )
        .fetch_one(&db.pool)
        .await
    }

    pub async fn find_by_team_id(db: &Database, team_id: impl AsRef<str>) -> Result<Vec<Self>, sqlx::Error> {
        sqlx::query_as!(
            UserTeamInvite,
            "SELECT * FROM user_team_invites WHERE team_id = $1",
            team_id.as_ref()
        )
        .fetch_all(&db.pool)
        .await
    }

    pub async fn find_by_team_and_user(
        db: &Database,
        team_id: impl AsRef<str>,
        user_id: impl AsRef<str>,
    ) -> Result<Self, sqlx::Error> {
        sqlx::query_as!(
            UserTeamInvite,
            "SELECT * FROM user_team_invites WHERE team_id = $1 AND user_id = $2",
            team_id.as_ref(),
            user_id.as_ref()
        )
        .fetch_one(&db.pool)
        .await
    }

    pub async fn delete_by_id(db: &Database, invite_id: impl AsRef<str>) -> Result<(), sqlx::Error> {
        sqlx::query!(
            "DELETE FROM user_team_invites WHERE invite_id = $1",
            invite_id.as_ref()
        )
        .execute(&db.pool)
        .await?;

        Ok(())
    }
}