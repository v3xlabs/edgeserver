use std::env;
use std::sync::Arc;

use async_std::prelude::FutureExt;
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
pub mod handlers;
pub mod ipfs;
pub mod server;

use tracing_subscriber::prelude::*;

#[async_std::main]
async fn main() {
    dotenvy::dotenv().ok();

    let otlp_endpoint = env::var("OTLP_ENDPOINT").ok();

    if let Some(endpoint) = otlp_endpoint {
        info!("Starting Edgerouter with OTLP tracing");
        
        // Set up propagator for trace context
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

        // Use a simple tracer provider configuration
        let trace_provider = opentelemetry_sdk::trace::SdkTracerProvider::builder()
            .with_resource(resource)
            .with_batch_exporter(exporter)
            .build();

        global::set_tracer_provider(trace_provider.clone());

        let tracer = trace_provider.tracer("edgeserver");

        // Simple telemetry layer
        let telemetry_layer = tracing_opentelemetry::layer()
            .with_tracer(tracer);

        // Create a formatting layer with span closure events
        let fmt_layer = tracing_subscriber::fmt::layer()
            .with_span_events(tracing_subscriber::fmt::format::FmtSpan::CLOSE);
        
        // Set up filter for relevant components
        let filter = tracing_subscriber::EnvFilter::from_default_env()
            .add_directive("poem=info".parse().unwrap())
            .add_directive("edgeserver=debug".parse().unwrap());
            
        // Register layers with the subscriber
        tracing_subscriber::registry()
            .with(filter)
            .with(fmt_layer)
            .with(telemetry_layer)
            .init();

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

    let app_state = Arc::new(state);

    // Concurrently run HTTP routes, router, and optionally RabbitMQ consumer
    if let Some(rabbit) = &app_state.clone().rabbit {
        rabbit
            .do_consume(&app_state.clone())
            .join(routes::serve(app_state.clone()))
            .join(server::serve(app_state.clone()))
            .await;
    } else {
        info!("No RabbitMQ connection found, running without RabbitMQ");
        routes::serve(app_state.clone())
            .join(server::serve(app_state.clone()))
            .await;
    }
}
