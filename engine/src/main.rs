use tracing::info;

pub mod models;
pub mod routes;
pub mod state;

#[async_std::main]
async fn main() {
    dotenvy::dotenv().ok();

    println!("Hello, world!");

    tracing_subscriber::fmt::init();

    info!("Starting Edgerouter");

    let state = state::AppState {};

    routes::serve(state).await;
}
