use poem::Result;
use poem_openapi::{param::Path, payload::Json, OpenApi};
use tracing::info;

use crate::{middlewares::auth::UserAuth, models::{site::Site, team::Team}, routes::ApiTags};

pub struct TeamApi;

#[OpenApi]
impl TeamApi {
    /// Get all teams
    ///
    /// Gets a list of all the teams you have access to
    #[oai(path = "/team", method = "get", tag = "ApiTags::Team")]
    pub async fn get_teams(&self, user: UserAuth) -> Result<Json<Vec<Team>>> {
        info!("Getting teams for user: {:?}", user);

        Ok(Json(vec![Team {
            team_id: "1".to_string(),
            name: "John Doe".to_string(),
        }]))
    }

    #[oai(path = "/team", method = "post", tag = "ApiTags::Team")]
    pub async fn create_team(&self, user: UserAuth) -> Result<Json<Team>> {
        info!("Creating team for user: {:?}", user);

        todo!();
    }

    #[oai(path = "/team/:team_id", method = "get", tag = "ApiTags::Team")]
    pub async fn get_team(&self, user: UserAuth, team_id: Path<String>) -> Result<Json<Team>> {
        info!("Getting team: {:?} for user: {:?}", team_id.0, user);

        todo!();
    }

    #[oai(path = "/team/:team_id", method = "put", tag = "ApiTags::Team")]
    pub async fn update_team(&self, user: UserAuth, team_id: Path<String>) -> Result<Json<Team>> {
        info!("Updating team: {:?} for user: {:?}", team_id.0, user);

        todo!();
    }

    #[oai(path = "/team/:team_id", method = "delete", tag = "ApiTags::Team")]
    pub async fn delete_team(&self, user: UserAuth, team_id: Path<String>) -> Result<Json<Team>> {
        info!("Deleting team: {:?} for user: {:?}", team_id.0, user);

        todo!();
    }
}
