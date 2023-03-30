use {
    opentelemetry::sdk::trace::Tracer as SdkTracer,
    tracing_subscriber::{fmt, prelude::__tracing_subscriber_SubscriberExt, Registry},
};

pub mod prelude {
    pub use tracing::{debug, error, info, trace, warn};
}

// Create a new tracing pipeline
pub fn init() -> SdkTracer {
    // Create a new Jaeger exporter pipeline
    let tracer: SdkTracer = opentelemetry_jaeger::new_agent_pipeline()
        .with_service_name("edgerouter.rs")
        .install_simple()
        .unwrap();
    // .install_batch(opentelemetry::runtime::Tokio)

    let subscriber = Registry::default().with(fmt::Layer::default());

    tracing::subscriber::set_global_default(subscriber).unwrap();

    tracer
}
