use std::sync::Arc;

use http::Request;
use opentelemetry::{
    sdk::trace,
    trace::{Span, SpanRef, TraceContextExt, Tracer},
    KeyValue,
};
use tokio::time::Instant;
use tracing::Level;

use tracing::info;

use crate::{network::extract_host, state::AppState};

pub async fn record_metrics<T>(
    request: Request<T>,
    state: &Arc<AppState>,
) -> (Instant, Request<T>, String, tracing::Span) {
    let start_time = Instant::now();

    let (request, host) = extract_host(request).unwrap();

    let mut span = tracing::span!(
        Level::INFO,
        "Request",
        method = request.method().as_str(),
        host = host,
        uri = request.uri().to_string(),
        route = request.uri().path().to_string()
    );

    (start_time, request, host, span)
}

pub fn post_metrics<T>(response: &http::Response<T>, time: Instant) {
    let duration = time.elapsed().as_micros() as f64;

    info!("-> {:.3}ms", (duration / 1000.0));

    tracing::span!(
        Level::INFO,
        "Request Complete",
        http.response_time = format!("{:.3}ms", (duration / 1000.0)),
        http.status_code = response.status().as_u16(),
    );
}
