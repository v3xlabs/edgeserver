use crate::models::deployment::{Deployment, DeploymentFileEntry};
use bytes::Bytes;
use serde_json::Value;
use std::time::Duration;

#[derive(Debug)]
pub struct Cache {
    /// Raw JSON-based cache used elsewhere in the app.
    pub raw: moka::future::Cache<String, Value>,
    /// Cache domain -> Deployment
    pub domain: moka::future::Cache<String, Option<Deployment>>,
    /// Cache `deployment_id:path` -> `DeploymentFileEntry`
    pub file_entry: moka::future::Cache<String, Option<DeploymentFileEntry>>,
    /// Cache `file_hash` -> Bytes for small files
    pub file_bytes: moka::future::Cache<String, Bytes>,
}

impl Default for Cache {
    fn default() -> Self {
        let raw = moka::future::Cache::builder()
            .max_capacity(1000)
            .time_to_live(Duration::from_secs(10))
            .build();
        let domain = moka::future::Cache::builder()
            .max_capacity(1000)
            .time_to_live(Duration::from_secs(300))
            .build();
        let file_entry = moka::future::Cache::builder()
            .max_capacity(10000)
            .time_to_live(Duration::from_secs(60))
            .build();
        let file_bytes = moka::future::Cache::builder()
            .max_capacity(1000)
            .time_to_live(Duration::from_secs(60 * 60))
            .build();
        Self {
            raw,
            domain,
            file_entry,
            file_bytes,
        }
    }
}

impl Cache {
    /// Invalidate cached deployment for this domain.
    pub async fn bump_domain(&self, domain: &str) {
        self.domain.invalidate(domain).await;
    }
}
