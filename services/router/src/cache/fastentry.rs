use tracing::instrument;

pub struct CacheEntry {
    // Example: http://edgeserver.io/example/path.yes
    path: String,
    fs: String, // 's1' | 's3' | 'nfs'
    // Example:
    location: String,
    // headers: String,
    // ssl: // '' | 'letsencrypt' | 'selfsigned'
}

pub async fn generate_compound_cache_key() -> String {
    "".to_string()
}

#[instrument]
pub async fn get_entry(
    client: &redis::Client,
) -> Result<Option<CacheEntry>, Box<dyn std::error::Error + 'static>> {
    // Get request from redis
    // let data = client.hgetall("");

    //

    let entry = CacheEntry {
        path: "http://edgeserver.io/example/path.yes".to_string(),
        fs: "http".to_string(),
        location: "http://s1.example.com/example/path.yes".to_string(),
    };

    Ok(Some(entry))
}
