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
        
        // Create a span with the parent context
        let mut span = self.tracer
            .span_builder(span_name)
            .with_kind(SpanKind::Server)
            .with_attributes(attributes)
            .start_with_context(&*self.tracer, &parent_cx);
        
        span.add_event("request.started".to_string(), vec![]);
        
        // Save the trace ID for later
        let trace_id = span.span_context().trace_id().to_string();
        
        // Using FutureExt to properly manage the span context
        async move {
            let res = self.inner.call(req).await;
            let cx = Context::current();
            let span = cx.span();
            
            let mut response = match res {
                Ok(resp) => resp.into_response(),
                Err(err) => err.into_response(),
            };

            // Update span with path pattern if available
            if let Some(path_pattern) = response.data::<PathPattern>() {
                const HTTP_PATH_PATTERN: Key = Key::from_static_str("http.path_pattern");
                span.update_name(format!("{} {}", method, path_pattern.0));
                span.set_attribute(KeyValue::new(
                    HTTP_PATH_PATTERN,
                    path_pattern.0.to_string(),
                ));
            }
            
            let status_code = response.status().as_u16();

            // Add response status info to span
            span.set_attribute(KeyValue::new(
                attribute::HTTP_RESPONSE_STATUS_CODE,
                status_code as i64,
            ));
            
            // Grafana specific attribute
            span.set_attribute(KeyValue::new(
                "http.status_code", 
                status_code as i64,
            ));
            
            // Set span status based on HTTP status code
            if response.status().is_success() {
                span.add_event("request.completed".to_string(), vec![]);
                span.set_status(Status::Ok);
            } else {
                span.add_event("request.error".to_string(), vec![
                    KeyValue::new(attribute::EXCEPTION_MESSAGE, response.status().to_string()),
                ]);
                span.set_status(Status::error(response.status().to_string()));
            }
            
            // Track content length if available
            if let Some(content_length) = response.headers().typed_get::<headers::ContentLength>() {
                span.set_attribute(KeyValue::new(
                    attribute::HTTP_RESPONSE_BODY_SIZE,
                    content_length.0 as i64,
                ));
            }
            
            // Add trace ID to response headers
            response.headers_mut().insert(
                "X-Trace-Id",
                HeaderValue::from_str(&trace_id)
                    .unwrap_or_else(|_| HeaderValue::from_static("unknown")),
            );
            
            Ok(response)
        }
        .with_context(Context::current_with_span(span))
        .await
    }
}
