use keys::TeamKeysApi;
use poem::{web::Data, Result};
use poem_openapi::{param::Path, payload::Json, types::multipart::Upload, Multipart, Object, OpenApi};
use serde::{Deserialize, Serialize};
use tracing::info;

use crate::{
    assets::AssetFile, middlewares::auth::UserAuth, models::{
        site::Site,
        team::{invite::UserTeamInvite, Team, TeamId},
        user::User,
    }, routes::{error::HttpError, ApiTags}, state::State
};

pub mod keys;

pub fn api_routes() -> impl OpenApi {
    (TeamApi, TeamKeysApi)
}

#[derive(Debug, Serialize, Deserialize, Object)]
pub struct CreateTeamRequest {
    pub name: String,
}

#[derive(Debug, Serialize, Deserialize, Object)]
pub struct InviteUserToTeamRequest {
    pub user_id: Option<String>,
}

pub struct TeamApi;

#[OpenApi]
impl TeamApi {
    /// Get all teams
    ///
    /// Gets a list of all the teams you have access to
    #[oai(path = "/team", method = "get", tag = "ApiTags::Team")]
    pub async fn get_teams(&self, user: UserAuth, state: Data<&State>) -> Result<Json<Vec<Team>>> {
        let user = user.required_session()?;
        info!("Getting teams for user: {:?}", user);

        Team::get_by_user_id(&state.0.database, &user.user_id)
            .await
            .map_err(HttpError::from)
            .map(Json)
            .map_err(poem::Error::from)
    }

    /// Create a team
    #[oai(path = "/team", method = "post", tag = "ApiTags::Team")]
    pub async fn create_team(
        &self,
        user: UserAuth,
        state: Data<&State>,
        body: Json<CreateTeamRequest>,
    ) -> Result<Json<Team>> {
        info!("Creating team for user: {:?}", user);
        let user = user.required_session()?;

        Team::new(&state.0.database, &body.name, &user.user_id)
            .await
            .map_err(HttpError::from)
            .map(Json)
            .map_err(poem::Error::from)
    }

    /// Get a team
    #[oai(path = "/team/:team_id", method = "get", tag = "ApiTags::Team")]
    pub async fn get_team(
        &self,
        user: UserAuth,
        state: Data<&State>,
        #[oai(name = "team_id", style = "simple")]
        team_id: Path<String>,
    ) -> Result<Json<Team>> {
        info!("Getting team: {:?} for user: {:?}", team_id.0, user);
        user.verify_access_to(&TeamId(&team_id.0)).await?;

        Team::get_by_id(&state.0.database, &team_id.0)
            .await
            .map_err(HttpError::from)
            .map(Json)
            .map_err(poem::Error::from)
    }

    /// Get team invites
    ///
    /// Gets a list of all the invites for a team
    #[oai(path = "/team/:team_id/invites", method = "get", tag = "ApiTags::Team")]
    pub async fn get_team_invites(
        &self,
        user: UserAuth,
        state: Data<&State>,
        #[oai(name = "team_id", style = "simple")]
        team_id: Path<String>,
    ) -> Result<Json<Vec<UserTeamInvite>>> {
        info!(
            "Getting team invites for team: {:?} for user: {:?}",
            team_id.0, user
        );

        user.verify_access_to(&TeamId(&team_id.0)).await?;

        UserTeamInvite::get_by_team_id(&state.0.database, &team_id.0)
            .await
            .map_err(HttpError::from)
            .map(Json)
            .map_err(poem::Error::from)
    }

    /// Invite a user to a team
    #[oai(path = "/team/:team_id/invites", method = "post", tag = "ApiTags::Team")]
    pub async fn invite_user_to_team(
        &self,
        user: UserAuth,
        state: Data<&State>,
        #[oai(name = "team_id", style = "simple")]
        team_id: Path<String>,
        body: Json<InviteUserToTeamRequest>,
    ) -> Result<Json<UserTeamInvite>> {
        info!(
            "Inviting user to team: {:?} for user: {:?}",
            team_id.0, body.user_id
        );

        user.verify_access_to(&TeamId(&team_id.0)).await?;

        let user = user.required_session()?;

        if !Team::is_owner(&state.0.database, &team_id.0, &user.user_id)
            .await
            .map_err(HttpError::from)?
        {
            Err(HttpError::Forbidden)?;
        }

        let user_to = body.user_id.clone();

        if let Some(user_to) = user_to.as_ref() {
            let user_to_obj = User::get_by_id(&state.0.database, &user_to)
                .await
                .map_err(HttpError::from)?;

            info!("User to invite directly to: {:?}", user_to_obj);
        }

        // Create "anonymous" invite (for now), replace None with user_id when we have a way to create invites for specific users
        UserTeamInvite::new(&state.0.database, &team_id.0, user_to, &user.user_id)
            .await
            .map_err(HttpError::from)
            .map(Json)
            .map_err(poem::Error::from)
    }

    /// Delete a team invite
    #[oai(
        path = "/team/:team_id/invite/:invite_id",
        method = "delete",
        tag = "ApiTags::Team"
    )]
    pub async fn delete_team_invite(
        &self,
        user: UserAuth,
        state: Data<&State>,
        #[oai(name = "team_id", style = "simple")]
        team_id: Path<String>,
        #[oai(name = "invite_id", style = "simple")]
        invite_id: Path<String>,
    ) -> Result<()> {
        info!(
            "Deleting team invite: {:?} for user: {:?}",
            invite_id.0, user
        );

        user.verify_access_to(&TeamId(&team_id.0)).await?;

        let user = user.required_session()?;

        if !Team::is_owner(&state.0.database, &team_id.0, &user.user_id)
            .await
            .map_err(HttpError::from)?
        {
            Err(HttpError::Forbidden)?;
        }

        UserTeamInvite::delete_by_id(&state.0.database, &invite_id.0)
            .await
            .map_err(HttpError::from)?;

        Ok(())
    }

    /// Get team sites
    ///
    /// Gets a list of all the sites for a team
    #[oai(path = "/team/:team_id/sites", method = "get", tag = "ApiTags::Team")]
    pub async fn get_team_sites(
        &self,
        user: UserAuth,
        state: Data<&State>,
        #[oai(name = "team_id", style = "simple")]
        team_id: Path<String>,
    ) -> Result<Json<Vec<Site>>> {
        info!(
            "Getting sites for team: {:?} for user: {:?}",
            team_id.0, user
        );

        user.verify_access_to(&TeamId(&team_id.0)).await?;

        Site::get_by_team_id(&state.0.database, &team_id.0)
            .await
            .map_err(HttpError::from)
            .map(Json)
            .map_err(poem::Error::from)
    }

    /// Get team members
    ///
    /// Gets a list of all the members for a team
    #[oai(path = "/team/:team_id/members", method = "get", tag = "ApiTags::Team")]
    pub async fn get_team_members(
        &self,
        user: UserAuth,
        state: Data<&State>,
        #[oai(name = "team_id", style = "simple")]
        team_id: Path<String>,
    ) -> Result<Json<Vec<User>>> {
        user.verify_access_to(&TeamId(&team_id.0)).await?;

        Team::get_members(&state.0.database, &team_id.0)
            .await
            .map_err(HttpError::from)
            .map(Json)
            .map_err(poem::Error::from)
    }

    /// Update a team
    ///
    /// Updates a team with the given name
    #[oai(path = "/team/:team_id", method = "put", tag = "ApiTags::Team")]
    pub async fn update_team(
        &self,
        user: UserAuth,
        state: Data<&State>,
        #[oai(name = "team_id", style = "simple")]
        team_id: Path<String>,
    ) -> Result<Json<Team>> {
        info!("Updating team: {:?} for user: {:?}", team_id.0, user);

        user.verify_access_to(&TeamId(&team_id.0)).await?;

        let user = user.required_session()?;

        if !Team::is_owner(&state.0.database, &team_id.0, &user.user_id)
            .await
            .map_err(HttpError::from)?
        {
            Err(HttpError::Forbidden)?;
        }

        todo!();
    }

    /// Delete a team
    ///
    /// Deletes a team
    #[oai(path = "/team/:team_id", method = "delete", tag = "ApiTags::Team")]
    pub async fn delete_team(
        &self,
        user: UserAuth,
        state: Data<&State>,
        #[oai(name = "team_id", style = "simple")]
        team_id: Path<String>,
    ) -> Result<()> {
        info!("Deleting team: {:?} for user: {:?}", team_id.0, user);

        let user = user.required_session()?;

        if !Team::is_owner(&state.0.database, &team_id.0, &user.user_id)
            .await
            .map_err(HttpError::from)?
        {
            Err(HttpError::Forbidden)?;
        }

        Team::delete_by_id(&state.0.database, &team_id.0)
            .await
            .map_err(HttpError::from)?;

        Ok(())
    }

    /// Upload a team avatar
    ///
    /// Uploads an avatar for a team
    #[oai(path = "/team/:team_id/avatar", method = "post", tag = "ApiTags::Team")]
    pub async fn upload_team_avatar(
        &self,
        user: UserAuth,
        state: Data<&State>,
        #[oai(name = "team_id", style = "simple")]
        team_id: Path<String>,
        body: UploadTeamAvatarRequest,
    ) -> Result<Json<Team>> {
        user.verify_access_to(&TeamId(&team_id.0)).await?;

        let user = user.required_session()?;

        if !Team::is_owner(&state.0.database, &team_id.0, &user.user_id)
            .await
            .map_err(HttpError::from)?
        {
            Err(HttpError::Forbidden)?;
        }

        let x = body.avatar;

        let file_name = x.file_name().unwrap().to_string();
        // Load into memory
        let file = x.into_vec().await.unwrap();

        let (_file, _, file_hash, _, _) = AssetFile::from_buffer(&state, &file, file_name).await.unwrap();

        let team = Team::update_avatar(&state.0.database, &team_id.0, &file_hash).await.unwrap();

        Ok(Json(team))
    }
}

#[derive(Debug, Multipart)]
pub struct UploadTeamAvatarRequest {
    pub avatar: Upload,
}
