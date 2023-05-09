use std::sync::Arc;

use hyper::body::Bytes;
use opentelemetry::{
    trace::{Span, Tracer},
    Context, KeyValue,
};

use crate::{cache::fastentry::CacheEntry, debug, state::AppState};

pub async fn entry_to_bytes(
    state: &Arc<AppState>,
    data: CacheEntry,
    cx: &Context,
) -> (Bytes, String) {
    let mut span2 = state.tracer.start_with_context("Request File", cx);

    span2.set_attribute(KeyValue::new("url".to_string(), data.location.to_string()));

    debug!("Requesting file from {}", data.location);

    state
        .storage
        .request(&state, &data.fs, data.signal_cid.unwrap(), data.location)
        .await
        .unwrap()
}
