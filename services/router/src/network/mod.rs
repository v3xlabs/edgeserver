use {
    crate::{AppState, RequestData},
    http::{Request, Response},
    http_body_util::Full,
    hyper::body::{Bytes, Incoming},
    opentelemetry::{
        trace::{Span, TraceContextExt, Tracer},
        KeyValue,
    },
    std::sync::Arc,
    tokio::time::Instant,
};

pub mod route;

use crate::error::Error;

#[derive(Debug, thiserror::Error)]
pub enum NetworkError {
    #[error("Missing host")]
    NoHost,
}

pub fn extract_host<T>(req: Request<T>) -> Result<(Request<T>, String), Error> {
    let host = req.headers().get("Host");

    match host {
        Some(host) => {
            let host = host.to_str().unwrap().to_string();
            Ok((req, host))
        }
        None => Err(Error::NetworkError(NetworkError::NoHost)),
    }
}

pub async fn handle_svc(
    request: Request<Incoming>,
    state: &Arc<AppState>,
) -> Result<Response<Full<Bytes>>, hyper::Error> {
    let start_time = Instant::now();

    let (request, host) = extract_host(request).unwrap();

    let span_name = format!("{} {}{}", request.method(), host, request.uri().path());

    let mut span = state.tracer.start(span_name);

    // Add some attributes to the span
    span.set_attribute(KeyValue::new("http.host", host.clone()));
    span.set_attribute(KeyValue::new("http.method", request.method().to_string()));
    span.set_attribute(KeyValue::new("http.uri", request.uri().to_string()));
    span.set_attribute(KeyValue::new(
        "http.route",
        request.uri().path().to_string(),
    ));

    let data = RequestData { host };

    let (response, cx) = route::handle(request, data, span, state.clone())
        .await
        .unwrap();

    let duration = start_time.elapsed();

    let micros = duration.as_micros();

    let micros_float = micros as f64;

    println!(
        "Successfully completed request in {:.3}ms",
        (micros_float / 1000.0)
    );

    let span = cx.span();

    span.set_attribute(KeyValue::new(
        "http.status_code",
        response.status().as_u16().to_string(),
    ));
    span.set_attribute(KeyValue::new(
        "http.response_time",
        format!("{:.3}ms", (micros_float / 1000.0)),
    ));

    Ok(response)
}
