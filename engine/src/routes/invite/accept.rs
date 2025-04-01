use poem::{web::Data, Result};
use poem_openapi::{param::Path, payload::Json, types::Example, ApiResponse, Object, OpenApi};
use serde::{Deserialize, Serialize};
use tracing::info;

use crate::{
    middlewares::auth::UserAuth,
    models::{
        team::{invite::UserTeamInvite, Team},
        user::User,
    },
    routes::{auth::BootstrapUserResponse, error::HttpError, ApiTags},
    state::State,
    utils::hash::hash_password,
};

#[derive(Debug, Deserialize, Serialize, Object)]
pub struct SiteCreateRequest {
    pub name: String,
    pub team_id: String,
}

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

#[derive(Debug, ApiResponse)]
#[allow(clippy::large_enum_variant)]
pub enum InviteAcceptBootstrapResponse {
    #[oai(status = 200)]
    Ok(Json<BootstrapUserResponse>),
    #[oai(status = 404)]
    NotFound(Json<NotFoundResponse>),
    #[oai(status = 409)]
    AlreadyExists(Json<AlreadyExistsResponse>),
}

#[derive(Debug, Deserialize, Serialize, Object)]
#[oai(example)]
pub struct NotFoundResponse {
    message: String,
}

impl Example for NotFoundResponse {
    fn example() -> Self {
        Self::default()
    }
}

impl Default for NotFoundResponse {
    fn default() -> Self {
        Self {
            message: "Invite not found".to_string(),
        }
    }
}

#[derive(Debug, Deserialize, Serialize, Object)]
#[oai(example)]
pub struct AcceptedResponse {
    message: String,
}

impl Example for AcceptedResponse {
    fn example() -> Self {
        Self::default()
    }
}

impl Default for AcceptedResponse {
    fn default() -> Self {
        Self {
            message: "Invite accepted".to_string(),
        }
    }
}

#[derive(Debug, Deserialize, Serialize, Object)]
#[oai(example)]
pub struct AlreadyExistsResponse {
    message: String,
}

impl Example for AlreadyExistsResponse {
    fn example() -> Self {
        Self::default()
    }
}

impl Default for AlreadyExistsResponse {
    fn default() -> Self {
        Self {
            message: "Invite already accepted".to_string(),
        }
    }
}

#[derive(Debug, ApiResponse)]
#[allow(clippy::large_enum_variant)]
pub enum InviteAcceptResponse {
    #[oai(status = 200)]
    Ok(Json<AcceptedResponse>),
    #[oai(status = 404)]
    NotFound(Json<NotFoundResponse>),
    #[oai(status = 409)]
    AlreadyExists(Json<AlreadyExistsResponse>),
}

pub struct InviteAcceptApi;

#[OpenApi]
impl InviteAcceptApi {
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
        #[oai(name = "invite_id", style = "simple")] invite_id: Path<String>,
    ) -> Result<InviteAcceptResponse> {
        info!("Accepting invite: {:?}", invite_id.0);

        let user = user.required_session()?;

        let invite = UserTeamInvite::get_by_invite_id(&state.database, &invite_id.0)
            .await
            .map_err(HttpError::from)?;

        if invite.status != "pending" {
            return Ok(InviteAcceptResponse::AlreadyExists(Json(
                AlreadyExistsResponse::default(),
            )));
        }

        UserTeamInvite::accept_invite(&state.database, &invite_id.0, &user.user_id)
            .await
            .map_err(HttpError::from)?;

        Ok(InviteAcceptResponse::Ok(Json(AcceptedResponse {
            message: "Invite accepted".to_string(),
        })))
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
        #[oai(name = "invite_id", style = "simple")] invite_id: Path<String>,
        request: Json<TeamInviteAcceptNewPayload>,
    ) -> Result<InviteAcceptBootstrapResponse> {
        let invite = UserTeamInvite::get_by_invite_id(&state.database, &invite_id.0)
            .await
            .map_err(HttpError::from)?;

        if invite.status != "pending" {
            return Ok(InviteAcceptBootstrapResponse::AlreadyExists(Json(
                AlreadyExistsResponse::default(),
            )));
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

        Ok(InviteAcceptBootstrapResponse::Ok(Json(
            BootstrapUserResponse { user, team },
        )))
    }
}
