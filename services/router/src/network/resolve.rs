use std::sync::Arc;

use hyper::body::Bytes;
use tracing::Level;

use crate::{cache::fastentry::CacheEntry, debug, state::AppState};

pub async fn entry_to_bytes(
    state: &Arc<AppState>,
    data: CacheEntry,
) -> (Bytes, String) {
    let span2 = tracing::span!(Level::INFO, "Request File url={}", data.location);
    let _enter = span2.enter();

    debug!("Requesting file from {}", data.location);

    state
        .storage
        .request(state, &data.fs, data.signal_cid.unwrap(), data.location)
        .await
        .unwrap()
}
