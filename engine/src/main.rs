use std::os::unix::fs::PermissionsExt;

use state::AppState;
use tracing::{error, info};

pub mod cache;
pub mod database;
pub mod middlewares;
pub mod models;
pub mod routes;
pub mod state;
pub mod storage;
pub mod utils;

#[async_std::main]
async fn main() {
    dotenvy::dotenv().ok();

    tracing_subscriber::fmt::init();

    info!("Starting Edgerouter");

    let state = match AppState::new().await {
        Ok(state) => state,
        Err(error) => {
            error!("Failed to load environment variables: {}", error);
            return;
        }
    };

    // ensure temp directory exists
    std::fs::create_dir_all("/tmp").ok();
    // ensure its owned by the user and has 777 permissions
    std::fs::set_permissions("/tmp", std::fs::Permissions::from_mode(0o777)).ok();

    routes::serve(state).await;
}
