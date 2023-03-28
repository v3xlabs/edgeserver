use std::sync::Arc;

use http::{Request, Response};
use hyper::Body;
use opentelemetry::{
    trace::{TraceContextExt, Tracer},
    Context,
};

use crate::{cache, AppState};

pub async fn handle(
    req: Request<Body>,
    span: opentelemetry::sdk::trace::Span,
    state: Arc<AppState>,
) -> Result<Response<Body>, hyper::Error> {
    let cx = Context::current_with_span(span);
    let new_span = state.tracer.start_with_context("Check Cache", &cx);

    println!("Request Received at {}", req.uri());

    let entry = cache::fastentry::get_entry(state.redis.clone())
        .await
        .unwrap();

    if entry.is_some() {
        println!("FastCache exists, using quick response.");

        // entry.fs == 'http'
    }

    // 
    crate::legacy::serve().await;

    drop(new_span);

    let body = "Hello, world!";
    Ok(Response::new(Body::from(body)))
}
