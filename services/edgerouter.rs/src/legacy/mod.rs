use std::{convert::Infallible, sync::Arc};

use crate::{
    cache::fastentry::CacheEntry,
    database::{get_domain_lookup, get_storage_id},
    debug,
    state::AppState,
};

mod traverse;

pub async fn serve(state: Arc<AppState>, base_url: &str, path: &str, cx: &opentelemetry::Context) -> Result<CacheEntry, Infallible> {
    debug!("LEGACY ROUTER REPORT");

    let (deploy_id, app_id) = get_domain_lookup(&state.database, base_url).await.unwrap();

    debug!("Deploy ID: {}", deploy_id);
    debug!("App ID: {}", app_id);

    // TODO: Load in configuration, redirects, and headers

    // Load SID from database
    let sid = get_storage_id(&state.database, app_id, deploy_id).await.unwrap();

    // Traverse till we find file
    let learned_entry =
        traverse::traverse_signalfs(&state.clone().storage.signalfs.clone().unwrap(), state.clone(), &sid.to_string(), path, cx).await.unwrap();

    Ok(learned_entry)
}
