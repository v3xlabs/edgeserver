use std::time::Duration;
use bytes::Bytes;
use serde::{Serialize, Deserialize};
use crate::models::deployment::DeploymentFileEntry;

/// Result of resolving a host and path to a deployment file entry or an error reason.
#[derive(Clone, Debug, Serialize, Deserialize)]
pub enum ResolveResult {
    /// Successfully found a deployment file entry.
    Success(DeploymentFileEntry),
    /// The resource was not found, with a reason message.
    NotFound(String),
    /// An internal error occurred during resolution, with an error message.
    Error(String),
}

#[derive(Debug)]
pub struct Cache {
    // pub raw: DashMap<String, Shared<BoxFuture<'static, CachedValue<serde_json::Value>>>>,
    pub raw: moka::future::Cache<String, serde_json::Value>,
    /// Cache for HTTP resolution results (domain + path).
    pub resolve: moka::future::Cache<String, ResolveResult>,
    /// Cache for bytes of small files to avoid repeated S3 fetches.
    pub file_bytes: moka::future::Cache<String, Bytes>,
}

impl Default for Cache {
    fn default() -> Self {
        Self {
            raw: moka::future::Cache::builder()
                .max_capacity(1000)
                .time_to_live(Duration::from_secs(10))
                .build(),
            resolve: moka::future::Cache::builder()
                .max_capacity(1000)
                .time_to_live(Duration::from_secs(60)) // TTL for resolution cache
                .build(),
            file_bytes: moka::future::Cache::builder()
                .max_capacity(1000)
                .build(),
        }
    }
}
