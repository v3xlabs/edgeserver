use std::{convert::Infallible, sync::Arc};

use http::{Request, Response};
use http_body_util::Full;
use hyper::{
    body::{Bytes, Incoming},
};
use opentelemetry::{
    trace::{Span, Tracer},
    KeyValue
};
use tokio::time::Instant;
use thousands::Separable;

use crate::{AppState, RequestData};

pub mod route;
pub mod util;

pub async fn handle_svc(
    request: Request<Incoming>,
    state: &Arc<AppState>,
) -> Result<Response<Full<Bytes>>, hyper::Error> {
    let start_time = Instant::now();

    let (req, host) = util::extract_host(request).unwrap();

    let mut span = state.tracer.start(format!("{} {}", req.method(), &host));

    // Add some attributes to the span
    span.set_attribute(KeyValue::new("http.host", host.clone()));
    span.set_attribute(KeyValue::new("http.method", req.method().to_string()));
    span.set_attribute(KeyValue::new("http.uri", req.uri().to_string()));
    span.set_attribute(KeyValue::new("http.route", req.uri().path().to_string()));

    let data = RequestData { host };

    let response = route::handle(req, data, span, state.clone()).await;

    let duration = start_time.elapsed();

    let micros = duration.as_micros();

    let micros_float = micros as f64;

    println!("Successfully completed request in {:.3}ms", (micros_float / 1000.0));

    response
}
