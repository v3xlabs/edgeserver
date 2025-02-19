use std::time::Duration;

#[derive(Debug)]
pub struct Cache {
    // pub raw: DashMap<String, Shared<BoxFuture<'static, CachedValue<serde_json::Value>>>>,
    pub raw: moka::future::Cache<String, serde_json::Value>,
}

impl Default for Cache {
    fn default() -> Self {
        Self {
            raw: moka::future::Cache::builder()
                .max_capacity(1000)
                .time_to_live(Duration::from_secs(10))
                .build(),
        }
    }
}
