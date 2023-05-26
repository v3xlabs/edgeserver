use {
    crate::{metrics::prelude::*, state::AppState},
    std::sync::Arc,
};

mod cache;
mod database;
mod environment;
mod error;
mod legacy;
mod metrics;
mod network;
mod server;
mod state;
mod storage;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    // Load environment variables
    dotenvy::dotenv().ok();

    // Init tracer
    let tracer = metrics::init();

    // Get Config
    let config = environment::get_config();

    // Bootstrap Redis
    let redis = cache::bootstrap(&config.redis_url).await;

    // Setup State
    let state = Arc::new(AppState::new(config, redis, tracer).await?);

    // Expose Metrics
    metrics::route::bootstrap(state.clone()).await;

    // Start Server
    server::bootstrap(state).await;

    Ok(())
}
