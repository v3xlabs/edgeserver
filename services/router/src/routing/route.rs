use std::sync::Arc;

use http::{Request, Response};
use http_body_util::Full;
use hyper::body::{Bytes, Incoming};
use opentelemetry::trace::Tracer;
use opentelemetry::KeyValue;
use opentelemetry::{trace::TraceContextExt, Context};

use crate::cache::fastentry::{generate_compound_cache_key, CacheEntry};
use crate::{cache, AppState, RequestData};

pub async fn handle(
    req: Request<Incoming>,
    data: RequestData,
    span: opentelemetry::sdk::trace::Span,
    state: Arc<AppState>,
) -> Result<Response<Full<Bytes>>, hyper::Error> {
    let mut cx = Context::current_with_span(span);

    println!("Request Received at {}{}", data.host, req.uri());

    let key = generate_compound_cache_key(&data.host, req.uri().to_string().as_str(), "http").await;

    let entry = {
        let _span = state.tracer.start_with_context("Check Cache", &cx);

        cache::fastentry::get_entry(state.redis.clone(), key.as_str())
            .await
            .unwrap()
    };

    if entry.is_some() {
        println!("FastCache exists, using quick response.");

        cx.span()
            .set_attribute(KeyValue::new("fastcache".to_string(), "true".to_string()));

        // entry.fs == 'http'
        return Ok(Response::new(Full::new(Bytes::from(format!(
            "{:?}",
            entry.unwrap()
        )))));
    }

    //
    crate::legacy::serve().await;

    let learned_entry = CacheEntry::new("path".to_string(), "fs".to_string(), "loc".to_string());

    tokio::spawn(async move {
        let _span = state.tracer.start_with_context("Set Cache (Async)", &cx);

        crate::cache::fastentry::set_entry(state.redis.clone(), key.as_str(), learned_entry)
            .await
            .unwrap()
    });

    let body = "Hello, world!";
    Ok(Response::new(Full::new(Bytes::from(body))))
}
