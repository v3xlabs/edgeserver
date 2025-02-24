use std::sync::Arc;

use async_std::path::Path;
use auth::AuthApi;
use invite::InviteApi;
use opentelemetry::global;
use opentelemetry::metrics::Counter;
use opentelemetry::KeyValue;
use opentelemetry_prometheus::PrometheusExporter;
use opentelemetry_prometheus::ExporterBuilder;
use opentelemetry_sdk::metrics::SdkMeterProvider;
use poem::web::Data;
use poem::{
    endpoint::StaticFilesEndpoint, get, handler, listener::TcpListener, middleware::Cors,
    web::Html, EndpointExt, Route, Server,
};
use poem_openapi::payload::PlainText;
use poem_openapi::{OpenApi, OpenApiService, Tags};
use prometheus::Registry;
use prometheus::{Encoder, TextEncoder};
use site::SiteApi;
use team::TeamApi;
use tracing::info;
use user::UserApi;

use crate::middlewares::metrics::OpenTelemetryMetrics;
use crate::middlewares::tracing::TraceId;
use crate::state::AppState;

pub mod auth;
pub mod error;
pub mod invite;
pub mod site;
pub mod team;
pub mod user;

fn get_api() -> impl OpenApi {
    (SiteApi, UserApi, AuthApi, TeamApi, InviteApi)
}

#[derive(Tags)]
pub enum ApiTags {
    /// Site-related endpoints
    Site,
    /// Invite-related endpoints
    Invite,
    /// Team-related endpoints
    Team,
    /// User-related endpoints
    User,
    /// Authentication-related endpoints
    #[oai(rename = "Authentication")]
    Auth,
}

pub async fn serve(state: AppState) {
    info!("Serving HTTP");

    let state = Arc::new(state);

    let api_service =
        OpenApiService::new(get_api(), "Hello World", "1.0").server("http://localhost:3000/api");
    let spec = api_service.spec_endpoint();

    let frontend_dir = Path::new("www");
    let file_endpoint = StaticFilesEndpoint::new(frontend_dir)
        .index_file("index.html")
        .fallback_to_index();

    let registry = prometheus::Registry::new();
    let exporter = opentelemetry_prometheus::exporter().with_registry(registry.clone()).build().unwrap();
    let provider = SdkMeterProvider::builder().with_reader(exporter).build();
    global::set_meter_provider(provider);

    let meter = global::meter("edgeserver");
    let counter = meter.u64_counter("test_counter").build();

    let app = Route::new()
        .nest("/api", api_service)
        .nest("/openapi.json", spec)
        .at("/docs", get(get_openapi_docs))
        .at("/metrics", get(metrics_handler).data(Arc::new(registry)).data(Arc::new(counter)))
        .nest("/", file_endpoint)
        .with(Cors::new())
        .with(OpenTelemetryMetrics::new())
        .with(TraceId::new(Arc::new(global::tracer("edgeserver"))))
        .data(state);

    let listener = TcpListener::bind("0.0.0.0:3000");

    Server::new(listener).run(app).await.unwrap();
}

#[handler]
async fn get_openapi_docs() -> Html<&'static str> {
    Html(include_str!("./index.html"))
}

#[handler]
async fn not_found() -> Html<&'static str> {
    // inline 404 template
    Html(include_str!("./404.html"))
}

#[handler]
async fn metrics_handler(registry: Data<&Arc<Registry>>, counter: Data<&Arc<Counter<u64>>>) -> String {
    counter.0.add(1, &[KeyValue::new("test_key", "test_value")]);

    // // Gather and format the metrics for Prometheus.
    let encoder = TextEncoder::new();
    let mf = registry.0.gather();
    let mut buffer = Vec::new();
    encoder.encode(&mf, &mut buffer).unwrap();

    String::from_utf8(buffer).unwrap()
}
