use std::sync::Arc;

use opentelemetry::{
    trace::{Span, SpanKind, Tracer},
    Context, Key, KeyValue,
};
use opentelemetry_semantic_conventions::{attribute, resource};
use poem::{
    http::HeaderValue,
    middleware::Middleware,
    web::{
        headers::{self, HeaderMapExt},
        RealIp,
    },
    Endpoint, FromRequest, IntoResponse, PathPattern, Request, Response, Result,
};
use tracing::{info_span, Instrument};


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

        // Prepare span attributes
        let mut attributes = Vec::new();
        attributes.push(KeyValue::new(
            resource::TELEMETRY_SDK_NAME,
            env!("CARGO_CRATE_NAME"),
        ));
        attributes.push(KeyValue::new(
            resource::TELEMETRY_SDK_VERSION,
            env!("CARGO_PKG_VERSION"),
        ));
        attributes.push(KeyValue::new(resource::TELEMETRY_SDK_LANGUAGE, "rust"));
        attributes.push(KeyValue::new(
            attribute::HTTP_REQUEST_METHOD,
            req.method().to_string(),
        ));
        attributes.push(KeyValue::new(
            attribute::URL_FULL,
            req.original_uri().to_string(),
        ));
        attributes.push(KeyValue::new(attribute::CLIENT_ADDRESS, remote_addr));
        attributes.push(KeyValue::new(
            attribute::NETWORK_PROTOCOL_VERSION,
            format!("{:?}", req.version()),
        ));

        // Get method for span name
        let method = req.method().to_string();
        
        // Create a completely new span for this request
        let mut span = self
            .tracer
            .span_builder(format!("{} {}", method, req.uri()))
            .with_kind(SpanKind::Server)
            .with_attributes(attributes)
            .start_with_context(&*self.tracer, &Context::new()); // Use a new blank context

        // Luc testing tracing compat
        let uri = req.uri().to_string();
        let tracing_span = info_span!("request", method = method.as_str(), uri = uri.as_str());

        // Record request start event
        span.add_event("request.started".to_string(), vec![]);
        
        // Get trace ID for response header
        let trace_id = span.span_context().trace_id().to_string();

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
                    span.update_name(format!("{} {}", method, path_pattern.0));
                    span.set_attribute(KeyValue::new(
                        HTTP_PATH_PATTERN,
                        path_pattern.0.to_string(),
                    ));
                }
                
                // Record successful completion
                span.add_event("request.completed".to_string(), vec![]);
                
                // Set response status
                span.set_attribute(KeyValue::new(
                    attribute::HTTP_RESPONSE_STATUS_CODE,
                    resp.status().as_u16() as i64,
                ));
                
                // Track content length if available
                if let Some(content_length) = resp.headers().typed_get::<headers::ContentLength>() {
                    span.set_attribute(KeyValue::new(
                        "http.response_body_size",
                        content_length.0 as i64,
                    ));
                }
                
                // Add trace ID to response headers
                resp.headers_mut().insert(
                    "X-Trace-Id",
                    HeaderValue::from_str(&trace_id)
                        .unwrap_or_else(|_| HeaderValue::from_static("unknown")),
                );
                
                // End the span
                span.end();
                
                Ok(resp)
            }
            Err(err) => {
                // Update span with path pattern if error has it
                if let Some(path_pattern) = err.data::<PathPattern>() {
                    const HTTP_PATH_PATTERN: Key = Key::from_static_str("http.path_pattern");
                    span.update_name(format!("{} {}", method, path_pattern.0));
                    span.set_attribute(KeyValue::new(
                        HTTP_PATH_PATTERN,
                        path_pattern.0.to_string(),
                    ));
                }
                
                // Set error status code
                span.set_attribute(KeyValue::new(
                    attribute::HTTP_RESPONSE_STATUS_CODE,
                    err.status().as_u16() as i64,
                ));
                
                // Record error event
                span.add_event(
                    "request.error".to_string(),
                    vec![KeyValue::new(attribute::EXCEPTION_MESSAGE, err.to_string())],
                );
                
                // End the span
                span.end();
                
                Err(err)
            }
        }
    }
}
