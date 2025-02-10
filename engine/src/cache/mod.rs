use chrono::{DateTime, Duration, Utc};
use dashmap::DashMap;
use futures::future::{BoxFuture, Shared};
use tracing::info;

#[derive(Debug)]
pub struct Cache {
    pub raw: DashMap<String, Shared<BoxFuture<'static, CachedValue<serde_json::Value>>>>,
}

impl Default for Cache {
    fn default() -> Self {
        Self {
            raw: DashMap::with_capacity(1000),
        }
    }
}

impl Cache {
    pub async fn has(&self, key: &str) -> Option<serde_json::Value> {
        info!("Cache has: {}", key);

        if let Some(x) = self.raw.get(key) {
            let x1 = x.clone().await;
            drop(x);

            info!("Cache hit: {}", key);

            if x1.is_expired() {
                self.raw.remove(key);
                return None;
            }

            Some(x1.value)
        } else {
            info!("Cache miss: {}", key);
            None
        }
    }
}

#[derive(Debug, Clone, Copy)]
pub struct CachedValue<T> {
    pub value: T,
    pub expires_at: DateTime<Utc>,
}

impl<T> CachedValue<T> {
    pub fn new(value: T, expires_at: DateTime<Utc>) -> Self {
        Self { value, expires_at }
    }

    pub fn new_with_ttl(value: T, ttl: Duration) -> Self {
        Self {
            value,
            expires_at: Utc::now() + ttl,
        }
    }
}

impl<T> CachedValue<T> {
    pub fn is_expired(&self) -> bool {
        self.expires_at < Utc::now()
    }
}
