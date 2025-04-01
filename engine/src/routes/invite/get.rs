use poem::{web::Data, Result};
use poem_openapi::{param::Path, payload::Json, ApiResponse, OpenApi};
use tracing::info;

use crate::{
    models::team::{invite::UserTeamInvite, Team},
    routes::{error::HttpError, invite::accept::TeamInviteData, ApiTags},
    state::State,
};

pub struct InviteGetApi;

#[derive(Debug, ApiResponse)]
#[allow(clippy::large_enum_variant)]
pub enum InviteGetResponse {
    #[oai(status = 200)]
    Ok(Json<TeamInviteData>),
    #[oai(status = 404)]
    NotFound,
}

#[OpenApi]
impl InviteGetApi {
    /// Get an invite
    ///
    /// Gets an invite by its ID
    #[oai(path = "/invite/:invite_id", method = "get", tag = "ApiTags::Invite")]
    pub async fn get_invite(
        &self,
        // user: UserAuth,
        state: Data<&State>,
        #[oai(name = "invite_id", style = "simple")] invite_id: Path<String>,
    ) -> Result<InviteGetResponse> {
        info!("Getting invite: {:?}", invite_id.0);

        let invite = UserTeamInvite::get_by_invite_id(&state.database, &invite_id.0)
            .await
            .map_err(HttpError::from)?;

        let team = Team::get_by_id(&state.database, &invite.team_id)
            .await
            .map_err(HttpError::from)?;

        Ok(InviteGetResponse::Ok(Json(TeamInviteData { invite, team })))
    }
}
