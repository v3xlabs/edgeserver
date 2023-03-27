use hyper::{Body, Request, Response, Server};
use opentelemetry::{
    trace::{mark_span_as_active, FutureExt, Span, TraceContextExt, Tracer},
    Context, KeyValue,
};

use std::{net::SocketAddr, sync::Arc};

#[derive(Clone, Debug)]
struct AppState {
    tracer: Arc<opentelemetry::sdk::trace::Tracer>,
    // metrics: Arc<MyMetrics>,
    redis: Arc<redis::Client>,
}

struct CacheEntry {
    // Example: http://edgeserver.io/example/path.yes
    path: String,
    fs: String, // 's1' | 's3' | 'nfs'
    // Example:
    location: String,
    // headers: String,
}

#[tracing::instrument]
async fn get_cached_entry(
    client: &redis::Client,
) -> Result<Option<CacheEntry>, Box<dyn std::error::Error + 'static>> {
    // Get request from redis

    //

    let entry = CacheEntry {
        path: "http://edgeserver.io/example/path.yes".to_string(),
        fs: "s1".to_string(),
        location: "http://s1.example.com/example/path.yes".to_string(),
    };

    Ok(Some(entry))
}

#[tracing::instrument]
async fn hello_world(
    req: Request<Body>,
    state: Arc<AppState>,
) -> Result<Response<Body>, hyper::Error> {
    // Get the current span from the request context

    let mut span = state.tracer.start("hello_world");

    // // Add some attributes to the span
    // span.set_attribute(KeyValue::new("http.method", req.method().to_string()));
    // span.set_attribute(KeyValue::new("http.route", req.uri().path().to_string()));

    let f = get_cached_entry(&state.redis).await.unwrap().unwrap();

    let body = "Hello, world!";
    Ok(Response::new(Body::from(body)))

    // Do some work here...
    // let mut prnt_context = Context::current_with_span(span);
    // {
    //     let mut child = tracer.start_with_context("childddd", &prnt_context);

    //     child.set_attribute(KeyValue::new("http.thing", req.method().to_string()));
    // }

    // let span = prnt_context.span();

    // span.set_attribute(KeyValue::new("http.status_code", 200));
}

#[tokio::main]
async fn main() {
    // Create a new tracing pipeline
    let tracer = opentelemetry_jaeger::new_agent_pipeline()
        .with_service_name("router")
        .install_simple()
        // .install_batch(opentelemetry::runtime::Tokio)
        .unwrap();

    let telemetry = tracing_opentelemetry().with_tracer(tracer);

    let redis = redis::Client::open("redis://0.0.0.0:6379").expect("Failed to connect to redis");

    let state = AppState {
        tracer: Arc::new(tracer),
        // metrics: Arc::new(MyMetrics::new()),
        redis: Arc::new(redis),
    };

    let state_arc = Arc::new(state);

    // Create a new Hyper server with tracing middleware
    let addr = SocketAddr::from(([127, 0, 0, 1], 1234));

    // Initialize and trace requests using hyper server
    let server = Server::bind(&addr).serve(hyper::service::make_service_fn(move |_| {
        let state_arc = state_arc.clone();
        let tracer = state_arc.tracer.clone();

        async move {
            Ok::<_, hyper::Error>(hyper::service::service_fn(move |mut req| {
                let cx = req.extensions_mut();

                // I hate this clone but im sure we can make it go poof
                cx.insert(tracer.clone());

                // cx.insert(tracer.clone());
                hello_world(req, state_arc.clone())
            }))
        }
    }));

    println!("Listening on http://{}", addr);
    if let Err(e) = server.await {
        eprintln!("server error: {}", e);
    }
}
