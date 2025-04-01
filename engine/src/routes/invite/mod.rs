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

pub mod get;
pub mod accept;

pub fn api_routes() -> impl OpenApi {
    (get::InviteGetApi, accept::InviteAcceptApi)
}
