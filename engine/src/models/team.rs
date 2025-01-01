use chrono::{DateTime, Utc};
use poem_openapi::Object;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Object)]
pub struct Team {
    pub team_id: String,
    pub owner_id: String,
    pub name: String,
}

#[derive(Debug, Serialize, Deserialize, Object)]
pub struct UserTeamInvite {
    pub invite_id: String,
    pub user_id: String,
    pub team_id: String,
    pub created_at: DateTime<Utc>,
}
