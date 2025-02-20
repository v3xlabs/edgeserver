use std::env;

use opentelemetry::{global, trace::TracerProvider};
use opentelemetry_otlp::WithExportConfig;
use state::AppState;
use tracing::{error, info};
use opentelemetry_sdk::Resource;
use opentelemetry::KeyValue;

pub mod cache;
pub mod database;
pub mod middlewares;
pub mod models;
pub mod routes;
pub mod state;
pub mod storage;
pub mod utils;

use tracing_subscriber::{prelude::*, EnvFilter};

#[async_std::main]
async fn main() {
    dotenvy::dotenv().ok();

    // let exporter = opentelemetry_otlp::SpanExporter::builder()
    //     .with_http()
    //     .with_endpoint("http://localhost:4317")
    //     .build()
    //     // .install_batch(opentelemetry_sdk::runtime::AsyncStd)
    //     .expect("Couldn't create OTLP tracer");

    let otlp_endpoint = env::var("OTLP_ENDPOINT").unwrap_or("http://localhost:4317".to_string());

    let exporter = opentelemetry_otlp::SpanExporter::builder()
        .with_tonic()
        .with_endpoint(otlp_endpoint)
        .build()
        // .install_batch(opentelemetry_sdk::runtime::AsyncStd)
        .expect("Couldn't create OTLP tracer");

    // Optionally get hostname via environment variable or using another method.
    let hostname = std::env::var("HOSTNAME")
        .unwrap_or_else(|_| "unknown".to_string());

    // Create a resource with the desired attributes.
    let resource = Resource::builder()
        .with_service_name("edgeserver")
        .with_attributes(vec![KeyValue::new("host.name", hostname)])
        .build();

    let trace_provider = opentelemetry_sdk::trace::SdkTracerProvider::builder()
        // Attach the resource here.
        .with_resource(resource)
        .with_batch_exporter(exporter)
        .build();

    global::set_tracer_provider(trace_provider.clone());

    let tracer = trace_provider.tracer("edgeserver");

    let telemetry_layer = tracing_opentelemetry::layer().with_tracer(tracer.clone());

    // tracing_subscriber::fmt::init();
    let fmt_layer = tracing_subscriber::fmt::layer();
    tracing_subscriber::registry()
        .with(fmt_layer)
        .with(telemetry_layer)
        // .with(EnvFilter::from_default_env())
        .init();

    info!("Starting Edgerouter");

    let state = match AppState::new().await {
        Ok(state) => state,
        Err(error) => {
            error!("Failed to load environment variables: {}", error);
            return;
        }
    };

    routes::serve(state, tracer).await;
}
