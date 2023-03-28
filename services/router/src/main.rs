use hyper::{Body, Request, Response, Server};
use opentelemetry::{
    global,
    trace::{Span, TraceContextExt, Tracer},
    Context, KeyValue,
};
use opentelemetry_http::HeaderExtractor;

use std::{net::SocketAddr, sync::Arc};

mod cache;

#[derive(Clone, Debug)]
struct AppState {
    tracer: Arc<opentelemetry::sdk::trace::Tracer>,
    // metrics: Arc<MyMetrics>,
    redis: Arc<redis::Client>,
}


async fn hello_world(
    req: Request<Body>,
    span: opentelemetry::sdk::trace::Span,
    state: Arc<AppState>,
) -> Result<Response<Body>, hyper::Error> {
    let cx = Context::current_with_span(span);
    let new_span = state.tracer.start_with_context("Check Cache", &cx);

    let _entry = cache::fastentry::get_entry(&state.redis).await.unwrap().unwrap();

    drop(new_span);

    let body = "Hello, world!";
    Ok(Response::new(Body::from(body)))
}

#[tokio::main]
async fn main() {
    // Create a new tracing pipeline
    let tracer = opentelemetry_jaeger::new_agent_pipeline()
        .with_service_name("router")
        .install_simple()
        // .install_batch(opentelemetry::runtime::Tokio)
        .unwrap();

    let redis = redis::Client::open("redis://0.0.0.0:6379").expect("Failed to connect to redis");

    let state = AppState {
        tracer: Arc::new(tracer),
        // metrics: Arc::new(MyMetrics::new()),
        redis: Arc::new(redis),
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

                let mut span = tracer
                    .start_with_context(format!("Request {}", req.uri()), &parent_cx);

                // Add some attributes to the span
                span.set_attribute(KeyValue::new("http.method", req.method().to_string()));
                span.set_attribute(KeyValue::new("http.uri", req.uri().to_string()));
                span.set_attribute(KeyValue::new("http.route", req.uri().path().to_string()));

                hello_world(req, span, state_arc.clone())
            }))
        }
    }));

    println!("Listening on http://{}", addr);
    if let Err(e) = server.await {
        eprintln!("server error: {}", e);
    }
}
