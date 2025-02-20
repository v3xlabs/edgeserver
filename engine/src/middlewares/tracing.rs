use std::sync::Arc;

use opentelemetry::{
    global,
    trace::{FutureExt, Span, SpanKind, TraceContextExt, Tracer},
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
use tracing::{info_span, Instrument, Metadata};
use tracing_opentelemetry::{self, OpenTelemetrySpanExt};

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
    E: Endpoint,
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
    E: Endpoint,
    T: Tracer + Send + Sync,
    T::Span: Send + Sync + 'static,
{
    type Output = Response;

    async fn call(&self, req: Request) -> Result<Self::Output> {
        let tracer = self.tracer.clone();

        let remote_addr = RealIp::from_request_without_body(&req)
            .await
            .ok()
            .and_then(|real_ip| real_ip.0)
            .map(|addr| addr.to_string())
            .unwrap_or_else(|| req.remote_addr().to_string());

        let parent_cx = global::get_text_map_propagator(|propagator| {
            propagator.extract(&HeaderExtractor(req.headers()))
        });

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

        let method = req.method().to_string();
        let mut span = tracer
            .span_builder(format!("{} {}", method, req.uri()))
            .with_kind(SpanKind::Server)
            .with_attributes(attributes)
            .start_with_context(&*tracer, &parent_cx);

        span.add_event("request.started".to_string(), vec![]);

        // let tracing_span = info_span!("request.started");
        let parent_context = Context::current_with_span(span);
        // tracing_span.set_parent(parent_context.clone());

        // set the tracing_opentelemetry span default for new spans to the parent_context
        let tracing_span = info_span!("tracing-request-started");
        tracing_span.set_parent(parent_context.clone());

        async move {
            let res = self.inner.call(req).await;
            let cx = Context::current();
            let span = cx.span();

            match res {
                Ok(resp) => {
                    let mut resp = resp.into_response();

                    if let Some(path_pattern) = resp.data::<PathPattern>() {
                        const HTTP_PATH_PATTERN: Key = Key::from_static_str("http.path_pattern");
                        span.update_name(format!("{} {}", method, path_pattern.0));
                        span.set_attribute(KeyValue::new(
                            HTTP_PATH_PATTERN,
                            path_pattern.0.to_string(),
                        ));
                    }

                    span.add_event("request.completed".to_string(), vec![]);
                    span.set_attribute(KeyValue::new(
                        attribute::HTTP_RESPONSE_STATUS_CODE,
                        resp.status().as_u16() as i64,
                    ));
                    // Grafana specific override
                    span.set_attribute(KeyValue::new(
                        "http.status_code",
                        resp.status().as_u16() as i64,
                    ));
                    if let Some(content_length) =
                        resp.headers().typed_get::<headers::ContentLength>()
                    {
                        span.set_attribute(KeyValue::new(
                            // attribute::HTTP_RESPONSE_BODY_SIZE,
                            "http.response_body_size",
                            content_length.0 as i64,
                        ));
                    }

                    resp.headers_mut().insert(
                        "X-Trace-Id",
                        HeaderValue::from_str(&span.span_context().trace_id().to_string())
                            .unwrap_or_else(|_| HeaderValue::from_static("unknown")),
                    );

                    Ok(resp)
                }
                Err(err) => {
                    if let Some(path_pattern) = err.data::<PathPattern>() {
                        const HTTP_PATH_PATTERN: Key = Key::from_static_str("http.path_pattern");
                        span.update_name(format!("{} {}", method, path_pattern.0));
                        span.set_attribute(KeyValue::new(
                            HTTP_PATH_PATTERN,
                            path_pattern.0.to_string(),
                        ));
                    }

                    span.set_attribute(KeyValue::new(
                        attribute::HTTP_RESPONSE_STATUS_CODE,
                        err.status().as_u16() as i64,
                    ));
                    span.add_event(
                        "request.error".to_string(),
                        vec![KeyValue::new(attribute::EXCEPTION_MESSAGE, err.to_string())],
                    );

                    let mut err = err.into_response();
                    err.headers_mut().insert(
                        "X-Trace-Id",
                        HeaderValue::from_str(&span.span_context().trace_id().to_string())
                            .unwrap_or_else(|_| HeaderValue::from_static("unknown")),
                    );

                    Ok(err)
                }
            }
        }
        .with_context(parent_context)
        .instrument(tracing_span)
        // .instrument(tracing_span)
        .await
    }
}
