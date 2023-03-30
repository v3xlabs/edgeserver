use std::{collections::HashMap, ops::Deref, sync::Arc};

use blake::Blake;
use redis::Commands;
use tracing::instrument;

#[derive(Debug, Clone)]
pub struct CacheEntry {
    // Example: http://edgeserver.io/example/path.yes
    pub path: String,
    pub fs: String, // 's1' | 's3' | 'nfs'
    // Example:
    pub location: String,
    // headers: String,
    // ssl: // '' | 'letsencrypt' | 'selfsigned'
}

impl CacheEntry {
    pub fn new(path: String, fs: String, location: String) -> Self {
        Self { path, fs, location }
    }
}

pub async fn generate_compound_cache_key(host: &str, path: &str, protocol: &str) -> String {
    let mut result = [0; 64];

    let mut state = Blake::new(512).unwrap();

    state.update(host.as_bytes());
    state.update(path.as_bytes());
    state.update(protocol.as_bytes());

    state.finalise(&mut result);

    String::from_utf8_lossy(&result).to_string()
}

#[instrument]
pub async fn get_entry(
    client: Arc<redis::Client>,
    key: &str,
) -> Result<Option<CacheEntry>, Box<dyn std::error::Error + 'static>> {
    // Get request from redis
    let data: HashMap<String, String> = client.deref().to_owned().hgetall(key).unwrap();

    // Print out the data lmeow
    println!("{:?}", data);

    if data.is_empty() {
        return Ok(None);
    }

    let data = data;

    let entry = CacheEntry {
        path: data.get("path").unwrap().to_string(),
        fs: data.get("fs").unwrap().to_string(),
        location: data.get("location").unwrap().to_string(),
    };

    Ok(Some(entry))
}

#[instrument]
pub async fn set_entry(
    client: Arc<redis::Client>,
    key: &str,
    data: CacheEntry,
) -> Result<CacheEntry, Box<dyn std::error::Error + 'static>> {
    let map = vec![
        ("path", data.path.as_str()),
        ("fs", data.fs.as_str()),
        ("location", data.location.as_str()),
    ];

    let mut c = client.deref().to_owned();

    // let mut con = client.get_async_connection().await.unwrap();

    redis::pipe().atomic().del(key).execute(&mut c);

    redis::pipe()
        .atomic()
        .cmd("HMSET")
        .arg(key)
        .arg(map)
        .execute(&mut c);

    Ok(data)
}