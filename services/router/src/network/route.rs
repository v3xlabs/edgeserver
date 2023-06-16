use http::{HeaderValue, StatusCode};

use crate::network::resolve;

use super::RequestData;

static NOTFOUND: &[u8] = b"Not Found";

use {
    crate::{cache, cache::fastentry::generate_compound_cache_key, AppState},
    http::{Request, Response},
    http_body_util::Full,
    hyper::body::{Bytes, Incoming},
    std::sync::Arc,
};

/// HTTP status code 404
fn not_found() -> Response<Full<Bytes>> {
    Response::builder()
        .status(StatusCode::NOT_FOUND)
        .body(Full::new(NOTFOUND.into()))
        .unwrap()
}

pub async fn handle(
    req: Request<Incoming>,
    data: RequestData,
    state: Arc<AppState>,
) -> Result<Response<Full<Bytes>>, hyper::Error> {
    // Get the cache key
    let key = generate_compound_cache_key(&data.host, req.uri().to_string().as_str(), "http").await;

    crate::debug!("key={}", key);

    let mut cached = true;

    // Get the cache entry if it exists
    let cached_entry = {
        let _span = tracing::span!(tracing::Level::INFO, "cache", key = key.as_str());

        cache::fastentry::get_entry(state.redis.clone(), key.as_str())
            .await
            .unwrap()
    };

    // Get the cache entry or resolve if it isn't available
    if cached_entry.is_none() {
        return Ok(not_found());
    }

    let entry = cached_entry.unwrap();

    // let entry = match cached_entry {
    //     Some(entry) => entry,
    //     None => {
    //         cached = false;

    //         None

    //         // Resolve the request
    //         // crate::legacy::serve(state.clone(), &data.host, &req.uri().to_string(), &cx)
    //         //     .await
    //     }
    // };

    // Get the file stream
    let (file_stream, mime_type) = resolve::entry_to_bytes(&state, entry).await;

    // Record metrics
    state.metrics.record_request(cached, data.host);

    // Create the response
    let mut response = Response::new(Full::new(file_stream));

    // Set the headers
    let headers = response.headers_mut();

    // Set the content-type header
    headers.append(
        "Content-Type",
        HeaderValue::from_str(mime_type.as_str()).unwrap(),
    );

    // Set the cache-control header to a sensible defaults (5 minutes)
    headers.append(
        "Cache-Control",
        HeaderValue::from_str("public, max-age=300, immutable").unwrap(),
    );

    // Set the server header
    headers.append(
        "X-Powered-By",
        HeaderValue::from_str("edgeserver.io").unwrap(),
    );

    Ok(response)
}
