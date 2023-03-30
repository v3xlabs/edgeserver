use {
    crate::{log::prelude::*, state::AppState},
    hyper::{server::conn::http1, service::service_fn},
    std::{net::SocketAddr, sync::Arc},
    tokio::net::TcpListener,
};

mod cache;
mod environment;
mod error;
mod legacy;
mod log;
mod network;
mod state;
mod storage;

#[derive(Debug)]
pub struct RequestData {
    host: String,
}

#[tokio::main]
async fn main() {
    // Load environment variables
    dotenvy::dotenv().unwrap();

    // Get Config
    let config = environment::get_config().expect("Failed to get configuration");

    // Define vars
    let redis_url = config.redis_url.clone();
    let port = config.port.clone();

    // Initialize redis
    let redis = redis::Client::open(redis_url).expect("Failed to connect to redis");

    let addr = SocketAddr::from(([127, 0, 0, 1], port));

    let state = AppState::new(config, redis);

    let state_arc = Arc::new(state);

    let listener = TcpListener::bind(addr).await.unwrap();

    info!("Listening on {}", addr);

    loop {
        let state_arc = state_arc.clone();

        let (stream, _) = listener.accept().await.unwrap();

        tokio::task::spawn(async move {
            let handle = http1::Builder::new()
                .serve_connection(
                    stream,
                    service_fn(|req| network::handle_svc(req, &state_arc)),
                )
                .await;

            if let Err(err) = handle {
                error!("Error serving connection: {:?}", err);
            }
        });
    }
}
