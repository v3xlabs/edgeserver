use hyper::{server::conn::http1, service::service_fn};

use serde::Deserialize;
use tokio::net::TcpListener;
use tracing::{debug, error, info, trace, warn};

use std::{net::SocketAddr, sync::Arc};

mod cache;
mod legacy;
mod metrics;
mod network;
mod storage;

#[derive(Clone, Debug)]
pub struct MinioState {
    url: String,
    bucket: String,
}

#[derive(Clone, Debug)]
pub struct AppState {
    tracer: Arc<opentelemetry::sdk::trace::Tracer>,
    // metrics: Arc<MyMetrics>,
    redis: Arc<redis::Client>,
    http: reqwest::Client,
    minio: Option<Arc<MinioState>>,
}

#[derive(Debug)]
pub struct RequestData {
    host: String,
}

#[tokio::main]
async fn main() {
    // Load environment variables
    dotenvy::dotenv().unwrap();

    // Initialize tracing
    let tracer = metrics::init();

    // Initialize redis
    let redis = redis::Client::open("redis://0.0.0.0:6379").expect("Failed to connect to redis");

    let minio_url = std::env::var("MINIO_URL").expect("MINIO_URL not set");
    let minio_bucket = std::env::var("MINIO_BUCKET").expect("MINIO_BUCKET not set");

    let minio_state = MinioState {
        url: minio_url,
        bucket: minio_bucket,
    };

    let addr = SocketAddr::from(([127, 0, 0, 1], 1234));

    let listener = TcpListener::bind(addr).await.unwrap();

    // Create state and create an Arc for the state
    let state = AppState {
        tracer: Arc::new(tracer),
        redis: Arc::new(redis),
        http: reqwest::Client::new(),
        minio: Some(Arc::new(minio_state)),
        // metrics: Arc::new(MyMetrics::new()),
    };

    let state_arc = Arc::new(state);

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
