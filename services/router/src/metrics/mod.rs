use opentelemetry::{
    sdk::trace::Tracer as SdkTracer,
};
use tracing_subscriber::{prelude::__tracing_subscriber_SubscriberExt};

// Create a new tracing pipeline
pub fn init() -> SdkTracer {
    // Create a new Jaeger exporter pipeline
    let tracer: SdkTracer = opentelemetry_jaeger::new_agent_pipeline()
        .with_service_name("edgerouter.rs")
        .install_simple()
        .unwrap();
    // .install_batch(opentelemetry::runtime::Tokio)

    let (writer, guard) = tracing_appender::non_blocking(std::io::stderr());

    let logger = tracing_subscriber::fmt::layer()
        .with_target(false)
        .with_ansi(atty::is(atty::Stream::Stderr))
        .with_writer(writer);

    let subscriber = tracing_subscriber::registry().with(logger);

    tracer
}
