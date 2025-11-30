use std::sync::Arc;

use opentelemetry::{
    Key, KeyValue, trace::{Status, TraceContextExt, Tracer}
};
use opentelemetry_semantic_conventions::attribute;
use poem::{
    http::HeaderValue,
    middleware::Middleware,
    web::{
        headers::{self, HeaderMapExt},
        RealIp,
    },
    Endpoint, FromRequest, IntoResponse, PathPattern, Request, Response, Result,
};
use tracing::{Instrument, info, span};
use tracing_opentelemetry::OpenTelemetrySpanExt;

/// Middleware that injects the OpenTelemetry trace ID into the response headers.
#[derive(Default)]
pub struct TraceId<T> {
    tracer: Arc<T>,
}

impl<T> TraceId<T> {
    pub fn new(tracer: Arc<T>) -> Self {
        Self { tracer }
    }
}

impl<T, E> Middleware<E> for TraceId<T>
where
    E: Endpoint<Output = Response>,
    T: Tracer + Send + Sync,
    T::Span: Send + Sync + 'static,
{
    type Output = TraceIdEndpoint<T, E>;

    fn transform(&self, ep: E) -> Self::Output {
        TraceIdEndpoint {
            inner: ep,
            tracer: self.tracer.clone(),
        }
    }
}

/// The endpoint wrapper produced by the TraceId middleware.
pub struct TraceIdEndpoint<T, E> {
    inner: E,
    tracer: Arc<T>,
}

impl<T, E> Endpoint for TraceIdEndpoint<T, E>
where
    E: Endpoint<Output = Response>,
    T: Tracer + Send + Sync,
    T::Span: Send + Sync + 'static,
{
    type Output = Response;

    async fn call(&self, req: Request) -> Result<Self::Output> {
        // Extract remote address info
        let remote_addr = RealIp::from_request_without_body(&req)
            .await
            .ok()
            .and_then(|real_ip| real_ip.0)
            .map(|addr| addr.to_string())
            .unwrap_or_else(|| req.remote_addr().to_string());

        let addr = remote_addr.clone();
        let host = req.headers().get("host").and_then(|h| h.to_str().ok()).unwrap_or("unknown").to_string();
        let uri = req.uri().to_string();
        let method = req.method().to_string();
        let span_name = format!("{} {} {}", method, host, uri);

        let tracing_span = span!(tracing::Level::INFO, "request", method = method, host = host, uri = uri, "otel.name" = span_name);

        tracing_span.set_attribute(attribute::CLIENT_ADDRESS, addr);
        tracing_span.set_attribute("otel.name", format!("{} {} {}", method, host, uri));
        tracing_span.set_attribute(attribute::TELEMETRY_SDK_NAME, env!("CARGO_CRATE_NAME"));
        tracing_span.set_attribute(attribute::TELEMETRY_SDK_VERSION, env!("CARGO_PKG_VERSION"));
        tracing_span.set_attribute(attribute::TELEMETRY_SDK_LANGUAGE, "rust");
        tracing_span.set_attribute(attribute::HTTP_REQUEST_METHOD, method.clone());
        tracing_span.set_attribute("http.method", method.clone());
        tracing_span.set_attribute("http.host", host);
        tracing_span.set_attribute("http.target", uri);
        // tracing_span.set_attribute(attribute::URL_FULL, uri);
        tracing_span.set_attribute(attribute::CLIENT_ADDRESS, remote_addr);
        tracing_span.set_attribute(attribute::NETWORK_PROTOCOL_VERSION, format!("{:?}", req.version()));

        let trace_id = tracing_span.context().span().span_context().trace_id().to_string();

        // Record request start event
        // span.add_event("request.started".to_string(), vec![]);
        // info!("request.started");

        // Get trace ID for response header
        // let trace_id = span.span_context().trace_id().to_string();
        // tracing_span.set_parent(context);

        // Process the request with the inner endpoint
        let res = self
            .inner
            .call(req)
            .instrument(tracing_span.clone())
            .await;

        // Process the response
        match res {
            Ok(resp) => {
                let mut resp = resp.into_response();

                // Update span with path pattern if available
                if let Some(path_pattern) = resp.data::<PathPattern>() {
                    const HTTP_PATH_PATTERN: Key = Key::from_static_str("http.path_pattern");
                    tracing_span.set_attribute(HTTP_PATH_PATTERN, path_pattern.0.to_string());
                    // span.update_name(format!("{} {}", method, path_pattern.0));
                    // span.set_attribute(KeyValue::new(
                    //     HTTP_PATH_PATTERN,
                    //     path_pattern.0.to_string(),
                    // ));
                }

                // Record successful completion
                info!("request.completed");
                // span.add_event("request.completed".to_string(), vec![]);

                // Set response status
                tracing_span.set_attribute(
                    attribute::HTTP_RESPONSE_STATUS_CODE,
                    resp.status().as_u16() as i64,
                );

                tracing_span.set_attribute(
                    attribute::OTEL_STATUS_CODE,
                    resp.status().as_u16() as i64,
                );
                tracing_span.set_attribute("http.status_code", resp.status().as_u16() as i64);

                // Track content length if available
                if let Some(content_length) = resp.headers().typed_get::<headers::ContentLength>() {
                    tracing_span.set_attribute(
                        "http.response_body_size",
                        content_length.0 as i64,
                    );
                }

                // Add trace ID to response headers
                resp.headers_mut().insert(
                    "X-Trace-Id",
                    HeaderValue::from_str(&trace_id)
                        .unwrap_or_else(|_| HeaderValue::from_static("unknown")),
                );

                // End the span

                Ok(resp)
            }
            Err(err) => {
                // Update span with path pattern if error has it
                if let Some(path_pattern) = err.data::<PathPattern>() {
                    const HTTP_PATH_PATTERN: Key = Key::from_static_str("http.path_pattern");
                    // span.update_name(format!("{} {}", method, path_pattern.0));
                    // span.set_attribute(KeyValue::new(
                        // HTTP_PATH_PATTERN,
                        // path_pattern.0.to_string(),
                    // ));
                }

                // Set error status code
                tracing_span.set_status(Status::Error { description: err.to_string().into() });
                tracing_span.set_attribute(
                    attribute::HTTP_RESPONSE_STATUS_CODE,
                    err.status().as_u16() as i64,
                );
                tracing_span.set_attribute("http.status_code", err.status().as_u16() as i64);

                tracing_span.set_attribute(attribute::EXCEPTION_MESSAGE, err.to_string());
                tracing_span.set_attribute(attribute::EXCEPTION_TYPE, err.to_string());

                // Record error event
                tracing_span.add_event(
                    "request.error".to_string(),
                    vec![KeyValue::new(attribute::EXCEPTION_MESSAGE, err.to_string())],
                );

                // End the span

                Err(err)
            }
        }
    }
}
