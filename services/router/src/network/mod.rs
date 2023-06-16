use {
    crate::AppState,
    http::{Request, Response},
    http_body_util::Full,
    hyper::body::{Bytes, Incoming},
    std::sync::Arc,
};

use http::header::ToStrError;
use tokio::time::Instant;
use tracing::Level;

pub mod resolve;
pub mod route;

#[derive(Debug)]
pub struct RequestData {
    host: String,
}

#[derive(Debug, thiserror::Error)]
pub enum NetworkError {
    #[error("Missing host")]
    NoHost,
    #[error("Malformatted host")]
    MalformattedHost(ToStrError),
}

// Implement into for NetworkError into ResponseStatusCode

pub fn extract_headers_and_host<T>(
    req: Request<T>,
) -> Result<(Request<T>, String), NetworkError> {
    let headers = req.headers().to_owned();

    let host = headers
        .get("Host")
        .ok_or(NetworkError::NoHost)?
        .to_str()
        .map_err(NetworkError::MalformattedHost)?.to_string();

    Ok((req, host))
}

// Handle incoming HTTP requests
pub async fn handle_svc(
    request: Request<Incoming>,
    state: &Arc<AppState>,
) -> Result<Response<Full<Bytes>>, hyper::Error> {
    let start_time: Instant = Instant::now();

    // Extract the headers and host and return StatusCode::NOT_FOUND on error
    let (request, host) = match extract_headers_and_host(request) {
        Ok(x) => x,
        Err(e) => {
            tracing::event!(Level::ERROR, error = %e);
            return Ok(Response::builder()
                .status(http::StatusCode::NOT_FOUND)
                .body(Full::from(Bytes::from("Not Found")))
                .unwrap());
        }
    };

    let span = tracing::span!(
        Level::INFO,
        "Request",
        method = request.method().as_str(),
        host = host,
        uri = request.uri().to_string(),
        route = request.uri().path().to_string()
    );
    let _guard = span.enter();

    let data = RequestData {
        host: host.to_string(),
    };

    // Handle the request
    let response = route::handle(request, data, state.clone()).await?;

    // Post metrics
    let duration = start_time.elapsed().as_micros() as f64;

    tracing::event!(
        Level::INFO,
        http.response_time = format!("{:.3}ms", (duration / 1000.0)),
        http.status_code = response.status().as_u16(),
    );

    // Return the response
    Ok(response)
}
