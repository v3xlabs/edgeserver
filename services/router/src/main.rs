use http::{Request, Response};
use hyper::{server::conn::http1, service::service_fn};
use opentelemetry::{
    global,
    sdk::propagation::TraceContextPropagator,
    trace::{Span, Tracer},
    KeyValue,
};
use tokio::net::TcpListener;
use tracing_subscriber::prelude::__tracing_subscriber_SubscriberExt;

use std::{convert::Infallible, net::SocketAddr, ops::Deref, sync::Arc};

mod cache;
mod legacy;
mod metrics;
mod routing;

#[derive(Clone, Debug)]
pub struct AppState {
    tracer: Arc<opentelemetry::sdk::trace::Tracer>,
    // metrics: Arc<MyMetrics>,
    redis: Arc<redis::Client>,
}

#[derive(Debug)]
pub struct RequestData {
    host: String,
}

#[tokio::main]
async fn main() {
    let tracer = metrics::init();

    let redis = redis::Client::open("redis://0.0.0.0:6379").expect("Failed to connect to redis");

    let addr = SocketAddr::from(([127, 0, 0, 1], 1234));

    let listener = TcpListener::bind(addr).await.unwrap();

    // Create state and create an Arc for the state
    let state = AppState {
        tracer: Arc::new(tracer),
        redis: Arc::new(redis),
        // metrics: Arc::new(MyMetrics::new()),
    };

    let state_arc = Arc::new(state);

    loop {
        let state_arc = state_arc.clone();

        let (stream, _) = listener.accept().await.unwrap();

        tokio::task::spawn(async move {
            if let Err(err) = http1::Builder::new()
                .serve_connection(
                    stream,
                    service_fn(|req| routing::handle_svc(req, &state_arc)),
                )
                .await
            {
                println!("Error serving connection: {:?}", err);
            }
        });
    }
}
