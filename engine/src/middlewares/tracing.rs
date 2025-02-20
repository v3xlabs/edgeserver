use opentelemetry::trace::TraceContextExt;
use poem::{
    http::HeaderValue,
    middleware::Middleware,
    Endpoint, IntoResponse, Request, Response, Result,
};
use tracing::Span;
use tracing_opentelemetry::OpenTelemetrySpanExt;

/// Middleware that injects the OpenTelemetry trace ID into the response headers.
#[derive(Default)]
pub struct TraceId;

impl<E: Endpoint> Middleware<E> for TraceId {
    type Output = TraceIdEndpoint<E>;

    fn transform(&self, ep: E) -> Self::Output {
        TraceIdEndpoint { inner: ep }
    }
}

/// The endpoint wrapper produced by the TraceId middleware.
pub struct TraceIdEndpoint<E> {
    inner: E,
}

impl<E: Endpoint> Endpoint for TraceIdEndpoint<E> {
    type Output = Response;

    async fn call(&self, req: Request) -> Result<Self::Output> {
        // Execute the inner endpoint.
        let response = self.inner.call(req).await?;

        // Extract the trace ID from the current tracing context.
        let trace_id = Span::current()
            .context()
            .span()
            .span_context()
            .trace_id()
            .to_string();

        // Add the trace ID to the response headers (under X-Trace-Id).
        let mut response = response.into_response();
        response.headers_mut().insert(
            "X-Trace-Id",
            HeaderValue::from_str(&trace_id)
                .unwrap_or_else(|_| HeaderValue::from_static("unknown")),
        );

        Ok(response)
    }
} 