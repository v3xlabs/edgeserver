use opentelemetry::trace::TraceContextExt;
use poem::{Body, Response};
use reqwest::StatusCode;
use tracing::Span;
use tracing_opentelemetry::OpenTelemetrySpanExt;

pub fn not_found() -> Response {
    let trace_id = Span::current().context().span().span_context().trace_id().to_string();
    let body = include_str!("./404.html").to_string().replace("{{TRACE_ID}}", &trace_id);

    Response::builder()
        .status(StatusCode::NOT_FOUND)
        .content_type("text/html; charset=utf-8")
        .body(Body::from_string(body))
}
