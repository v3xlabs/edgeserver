use std::sync::Arc;

use http::Request;
use opentelemetry::{sdk::trace, trace::{Tracer, Span, TraceContextExt, SpanRef}, KeyValue};
use tokio::time::Instant;

use crate::{info, state::AppState, network::extract_host};

pub async fn record_metrics<T>(
    request: Request<T>,
    state: &Arc<AppState>,
) -> (Instant, Request<T>, String, trace::Span) {
    let start_time = Instant::now();

    let (request, host) = extract_host(request).unwrap();

    let span_name = format!("{} {}{}", request.method(), host, request.uri().path());

    info!("{}", span_name);

    let mut span = state.tracer.start(span_name);

    // Add some attributes to the span
    span.set_attribute(KeyValue::new("http.host", host.clone()));
    span.set_attribute(KeyValue::new("http.method", request.method().to_string()));
    span.set_attribute(KeyValue::new("http.uri", request.uri().to_string()));
    span.set_attribute(KeyValue::new(
        "http.route",
        request.uri().path().to_string(),
    ));

    (start_time, request, host, span)
}

pub fn post_metrics<'a,T>(
    response: &http::Response<T>,
    context: &'a opentelemetry::Context,
    time: Instant,
) -> SpanRef<'a> {

    let duration = time.elapsed().as_micros() as f64;
    
    info!("-> {:.3}ms", (duration / 1000.0));

    let span: SpanRef = context.span();

    span.set_attribute(KeyValue::new(
        "http.status_code",
        response.status().as_u16().to_string(),
    ));
    span.set_attribute(KeyValue::new(
        "http.response_time",
        format!("{:.3}ms", (duration / 1000.0)),
    ));

    span
}