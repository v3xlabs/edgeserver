use std::env;

use opentelemetry::KeyValue;
use opentelemetry::{global, trace::TracerProvider};
use opentelemetry_otlp::WithExportConfig;
use opentelemetry_sdk::trace::SdkTracerProvider;
use opentelemetry_sdk::Resource;
use state::AppState;
use tracing::{error, info, warn, Subscriber};

pub mod assets;
pub mod cache;
pub mod database;
pub mod middlewares;
pub mod models;
pub mod routes;
pub mod state;
pub mod storage;
pub mod utils;

use tracing_subscriber::layer::Layered;
use tracing_subscriber::{prelude::*, EnvFilter};

#[async_std::main]
async fn main() {
    // Initialize the log bridge early so that all log records are captured.
    // tracing_log::LogTracer::init().expect("Failed to set logger");

    dotenvy::dotenv().ok();

    let otlp_endpoint = std::env::var("OTLP_ENDPOINT").ok();
    let fmt_layer = tracing_subscriber::fmt::layer();
    let env_filter = tracing_subscriber::EnvFilter::from_default_env();

    // Create a subscriber based on whether OTLP is configured.
    let (subscriber, tracer_provider): (
        Box<dyn Subscriber + Send + Sync>,
        Option<SdkTracerProvider>,
    ) = if let Some(endpoint) = otlp_endpoint {
        let exporter = opentelemetry_otlp::SpanExporter::builder()
            .with_tonic()
            .with_endpoint(endpoint)
            .build()
            .expect("Couldn't create OTLP tracer");

        let hostname = std::env::var("HOSTNAME").unwrap_or_else(|_| "unknown".to_string());
        let resource = opentelemetry_sdk::Resource::builder()
            .with_service_name("edgeserver")
            .with_attribute(opentelemetry::KeyValue::new("host.name", hostname))
            .build();

        // let sql_resource = opentelemetry_sdk::Resource::builder()
        //     .with_service_name("postgresql")
        //     .with_attribute(opentelemetry::KeyValue::new("host.name", hostname))
        //     .build();

        let tracer_provider = opentelemetry_sdk::trace::SdkTracerProvider::builder()
            .with_resource(resource)
            .with_batch_exporter(exporter)
            .build();

        opentelemetry::global::set_tracer_provider(tracer_provider.clone());
        let tracer = tracer_provider.tracer("edgeserver");

        let telemetry_layer = tracing_opentelemetry::layer()
            .with_level(true)
            .with_tracer(tracer.clone())
            .with_error_fields_to_exceptions(true)
            .with_tracked_inactivity(true);

        (
            Box::new(
                tracing_subscriber::registry()
                    .with(fmt_layer)
                    .with(env_filter)
                    .with(telemetry_layer),
            ),
            Some(tracer_provider),
        )
    } else {
        (
            Box::new(
                tracing_subscriber::registry()
                    .with(fmt_layer)
                    .with(env_filter),
            ),
            None,
        )
    };

    // Use try_init() to avoid a panic if a global subscriber is already set.
    subscriber.try_init().unwrap_or_else(|err| {
        eprintln!("Global subscriber already set: {}", err);
    });

    tracing::info!("Starting Edgerouter...");

    let state = match AppState::new().await {
        Ok(state) => state,
        Err(error) => {
            error!("Failed to load environment variables: {}", error);
            return;
        }
    };

    routes::serve(state).await;

    if let Some(tracer_provider) = tracer_provider {
        warn!("Shutting down tracer provider");
        tracer_provider.force_flush();
        tracer_provider.shutdown();
    }
}
