use state::AppState;
use tracing::{error, info};

pub mod database;
pub mod middlewares;
pub mod models;
pub mod routes;
pub mod state;

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

    routes::serve(state).await;
}
