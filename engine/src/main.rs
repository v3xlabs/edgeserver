use std::env;

use opentelemetry::KeyValue;
use opentelemetry::{global, trace::TracerProvider};
use opentelemetry_otlp::WithExportConfig;
use opentelemetry_sdk::propagation::TraceContextPropagator;
use opentelemetry_sdk::Resource;
use state::AppState;
use tracing::{error, info};

pub mod assets;
pub mod cache;
pub mod database;
pub mod middlewares;
pub mod models;
pub mod routes;
pub mod state;
pub mod storage;
pub mod utils;
pub mod rabbit;
pub mod sqlxshim;

use tracing_subscriber::{prelude::*, EnvFilter};

#[async_std::main]
async fn main() {
    dotenvy::dotenv().ok();
    // tracing_log::LogTracer::init().expect("Failed to initialize logger");

    // let exporter = opentelemetry_otlp::SpanExporter::builder()
    //     .with_http()
    //     .with_endpoint("http://localhost:4317")
    //     .build()
    //     // .install_batch(opentelemetry_sdk::runtime::AsyncStd)
    //     .expect("Couldn't create OTLP tracer");

    let otlp_endpoint = env::var("OTLP_ENDPOINT").ok();

    if let Some(endpoint) = otlp_endpoint {
        info!("Starting Edgerouter with OTLP tracing");
        opentelemetry::global::set_text_map_propagator(TraceContextPropagator::new());

        let exporter = opentelemetry_otlp::SpanExporter::builder()
            .with_tonic()
            .with_endpoint(endpoint)
            .build()
            .expect("Couldn't create OTLP tracer");

        let hostname = std::env::var("HOSTNAME").unwrap_or_else(|_| "unknown".to_string());

        let resource = Resource::builder()
            .with_service_name("edgeserver")
            .with_attribute(KeyValue::new("host.name", hostname))
            .build();

        let trace_provider = opentelemetry_sdk::trace::SdkTracerProvider::builder()
            .with_resource(resource)
            .with_batch_exporter(exporter)
            .build();

        global::set_tracer_provider(trace_provider.clone());

        let tracer = trace_provider.tracer("edgeserver");

        let telemetry_layer = tracing_opentelemetry::layer()
            .with_tracer(tracer.clone())
            .with_error_fields_to_exceptions(true)
            .with_tracked_inactivity(true);

        let fmt_layer = tracing_subscriber::fmt::layer();
        let filter = tracing_subscriber::EnvFilter::from_default_env()
            .add_directive("sqlx=trace".parse().unwrap());
        tracing_subscriber::registry()
            .with(fmt_layer)
            .with(sqlxshim::SqlxEventToSpanLayer)
            .with(telemetry_layer)
            .with(filter)
            .init();
        // tracing_subscriber::fmt::init();

    } else {
        info!("Starting Edgerouter without OTLP tracing, provide OTLP_ENDPOINT to enable tracing");
        tracing_subscriber::fmt::init();
    }

    let state = match AppState::new().await {
        Ok(state) => state,
        Err(error) => {
            error!("Failed to load environment variables: {}", error);
            return;
        }
    };

    routes::serve(state).await;
}
