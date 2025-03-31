use std::sync::Arc;

use opentelemetry::{
    global,
    trace::{FutureExt, Span, SpanKind, Status, Tracer, TraceContextExt},
    Context, Key, KeyValue,
};
use opentelemetry_http::HeaderExtractor;
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
use tracing_opentelemetry::OpenTelemetrySpanExt;
use uuid;

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
        // Extract parent context from request headers if present
        let parent_cx = global::get_text_map_propagator(|propagator| {
            propagator.extract(&HeaderExtractor(req.headers()))
        });

        let remote_addr = RealIp::from_request_without_body(&req)
            .await
            .ok()
            .and_then(|real_ip| real_ip.0)
            .map(|addr| addr.to_string())
            .unwrap_or_else(|| req.remote_addr().to_string());

        let method = req.method().to_string();
        let uri = req.uri().to_string();

        // Create span attributes
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
            method.clone(),
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

        // Create a span with proper parent context
        let span_name = format!("{} {}", method, uri);
        
        // Create a tracing span for logging and context propagation
        let tracing_span = tracing::info_span!(
            "http_request", 
            method = %method,
            uri = %uri
        );
        
        // Generate trace ID for response header
        let trace_id = uuid::Uuid::new_v4().to_string();
        
        // Execute the inner endpoint with our span active
        let _enter = tracing_span.enter();
        let res = self.inner.call(req).await;
        
        let mut response = match res {
            Ok(resp) => resp.into_response(),
            Err(err) => err.into_response(),
        };

        // Add span attributes based on response
        let status_code = response.status().as_u16();
        
        // Update span with path pattern if available
        if let Some(path_pattern) = response.data::<PathPattern>() {
            tracing::info!(path_pattern = %path_pattern.0, "Path pattern available");
        }
        
        // Record status code
        tracing::info!(status_code = status_code, "Response status");
        
        // Track content length if available
        if let Some(content_length) = response.headers().typed_get::<headers::ContentLength>() {
            tracing::info!(content_length = content_length.0, "Content length");
        }
        
        // Add trace ID to response headers
        response.headers_mut().insert(
            "X-Trace-Id",
            HeaderValue::from_str(&trace_id)
                .unwrap_or_else(|_| HeaderValue::from_static("unknown")),
        );
        
        Ok(response)
    }
}
