use poem::{web::Data, Result};
use poem_openapi::{
    param::Path, payload::{Json, PlainText}, types::Example, Object, OpenApi
};
use serde::{Deserialize, Serialize};
use tracing::info;

use crate::{
    middlewares::auth::UserAuth,
    models::{
        team::{invite::UserTeamInvite, Team},
        user::User,
    },
    routes::ApiTags,
    state::State,
    utils::hash::hash_password,
};

use super::{auth::BootstrapUserResponse, error::HttpError};

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

#[derive(Deserialize, Debug, Object)]
#[oai(example)]
pub struct TeamInviteAcceptNewPayload {
    username: String,
    password: String,
}

impl Example for TeamInviteAcceptNewPayload {
    fn example() -> Self {
        Self {
            username: "john".to_string(),
            password: "password123".to_string(),
        }
    }
}

#[OpenApi]
impl InviteApi {
    /// Get an invite
    ///
    /// Gets an invite by its ID
    #[oai(path = "/invite/:invite_id", method = "get", tag = "ApiTags::Invite")]
    pub async fn get_invite(
        &self,
        // user: UserAuth,
        state: Data<&State>,
        #[oai(name = "invite_id", style = "simple")]
        invite_id: Path<String>,
    ) -> Result<Json<TeamInviteData>> {
        info!("Getting invite: {:?}", invite_id.0);

        // user.required()?;

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
    /// Accepts an invite by its ID, this endpoint requires you to be authenticated
    /// The invite will be accepted as the user you are authenticated as
    #[oai(
        path = "/invite/:invite_id/accept",
        method = "post",
        tag = "ApiTags::Invite"
    )]
    pub async fn accept_invite(
        &self,
        user: UserAuth,
        state: Data<&State>,
        #[oai(name = "invite_id", style = "simple")]
        invite_id: Path<String>,
    ) -> Result<PlainText<String>> {
        info!("Accepting invite: {:?}", invite_id.0);

        let user = user.required_session()?;

        let invite = UserTeamInvite::get_by_invite_id(&state.database, &invite_id.0)
            .await
            .map_err(HttpError::from)?;

        if invite.status != "pending" {
            return Err(HttpError::AlreadyExists.into());
        }

        UserTeamInvite::accept_invite(&state.database, &invite_id.0, &user.user_id)
            .await
            .map_err(HttpError::from)?;

        Ok(PlainText("Invite accepted".to_string()))
    }

    /// Accept an invite and create a user
    ///
    /// Accepts an invite by its ID and onboards as a new user
    /// This endpoint does not require authentication
    #[oai(
        path = "/invite/:invite_id/accept/new",
        method = "post",
        tag = "ApiTags::Invite"
    )]
    async fn bootstrap_user(
        &self,
        state: Data<&State>,
        #[oai(name = "invite_id", style = "simple")]
        invite_id: Path<String>,
        request: Json<TeamInviteAcceptNewPayload>,
    ) -> Result<Json<BootstrapUserResponse>> {
        let invite = UserTeamInvite::get_by_invite_id(&state.database, &invite_id.0)
            .await
            .map_err(HttpError::from)?;

        if invite.status != "pending" {
            return Err(HttpError::AlreadyExists.into());
        }

        let (user, team) = User::new(
            &state.0.database,
            &request.username,
            &hash_password(&request.password),
            Some(false),
            Some(invite.team_id),
        )
        .await
        .map_err(HttpError::from)?;

        UserTeamInvite::accept_invite(&state.database, &invite_id.0, &user.user_id)
            .await
            .map_err(HttpError::from)?;

        Ok(Json(BootstrapUserResponse { user, team }))
    }
}
