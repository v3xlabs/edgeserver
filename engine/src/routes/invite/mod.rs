use poem::{web::Data, Result};
use poem_openapi::{
    param::Path, payload::{Json, PlainText}, types::multipart::Upload, Multipart, Object, OpenApi,
};
use serde::{Deserialize, Serialize};
use tracing::info;

use crate::{
    middlewares::auth::UserAuth,
    models::{
        site::Site,
        team::{invite::UserTeamInvite, Team},
    },
    routes::ApiTags,
    state::State,
};

use super::error::HttpError;

#[derive(Debug, Deserialize, Serialize, Object)]
pub struct SiteCreateRequest {
    pub name: String,
    pub team_id: String,
}

pub struct InviteApi;

#[derive(Debug, Deserialize, Serialize, Object)]
pub struct TeamInviteData {
    pub invite: UserTeamInvite,
    pub team: Team,
}

#[OpenApi]
impl InviteApi {
    /// Get an invite
    ///
    /// Gets an invite by its ID
    #[oai(path = "/invite/:invite_id", method = "get", tag = "ApiTags::Invite")]
    pub async fn get_invite(
        &self,
        user: UserAuth,
        state: Data<&State>,
        invite_id: Path<String>,
    ) -> Result<Json<TeamInviteData>> {
        info!("Getting invite: {:?}", invite_id.0);

        user.required()?;

        let invite = UserTeamInvite::get_by_invite_id(&state.database, &invite_id.0)
            .await
            .map_err(HttpError::from)?;

        let team = Team::get_by_id(&state.database, &invite.team_id)
            .await
            .map_err(HttpError::from)?;

        Ok(Json(TeamInviteData { invite, team }))
    }

    /// Accept an invite
    ///
    /// Accepts an invite by its ID
    #[oai(path = "/invite/:invite_id/accept", method = "post", tag = "ApiTags::Invite")]
    pub async fn accept_invite(&self, user: UserAuth, state: Data<&State>, invite_id: Path<String>) -> Result<PlainText<String>> {
        info!("Accepting invite: {:?}", invite_id.0);

        let user = user.required()?;

        UserTeamInvite::accept_invite(&state.database, &invite_id.0, &user.user_id)
            .await
            .map_err(HttpError::from)?;

        Ok(PlainText("Invite accepted".to_string()))
    }
}
