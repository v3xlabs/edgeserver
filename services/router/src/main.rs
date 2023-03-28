use hyper::Server;
use opentelemetry::{
    global,
    trace::{Span, Tracer},
    KeyValue, sdk::propagation::TraceContextPropagator,
};
use opentelemetry_http::HeaderExtractor;
use tracing_subscriber::prelude::__tracing_subscriber_SubscriberExt;

use std::{net::SocketAddr, sync::Arc};

mod cache;
mod metrics;
mod routing;
mod legacy;

#[derive(Clone, Debug)]
pub struct AppState {
    tracer: Arc<opentelemetry::sdk::trace::Tracer>,
    // metrics: Arc<MyMetrics>,
    redis: Arc<redis::Client>,
}

#[tokio::main]
async fn main() {
    let tracer = metrics::init();

    let redis = redis::Client::open("redis://0.0.0.0:6379").expect("Failed to connect to redis");

    let state = AppState {
        tracer: Arc::new(tracer),
        redis: Arc::new(redis),
        // metrics: Arc::new(MyMetrics::new()),
    };

    let state_arc = Arc::new(state);

    let addr = SocketAddr::from(([127, 0, 0, 1], 1234));

    // Initialize and trace requests using hyper server
    let server = Server::bind(&addr).serve(hyper::service::make_service_fn(move |_| {
        let state_arc = state_arc.clone();
        let tracer = state_arc.tracer.clone();

        async move {
            Ok::<_, hyper::Error>(hyper::service::service_fn(move |req| {
                let parent_cx = global::get_text_map_propagator(|propagator| {
                    propagator.extract(&HeaderExtractor(req.headers()))
                });

                let mut span =
                    tracer.start_with_context(format!("Request {}", req.uri()), &parent_cx);

                // Add some attributes to the span
                span.set_attribute(KeyValue::new("http.method", req.method().to_string()));
                span.set_attribute(KeyValue::new("http.uri", req.uri().to_string()));
                span.set_attribute(KeyValue::new("http.route", req.uri().path().to_string()));

                routing::handle(req, span, state_arc.clone())
            }))
        }
    }));

    println!("Listening on http://{}", addr);
    if let Err(e) = server.await {
        eprintln!("server error: {}", e);
    }
}
