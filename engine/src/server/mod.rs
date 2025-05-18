use std::sync::Arc;

use opentelemetry::global;
use poem::middleware::OpenTelemetryMetrics;
use poem::web::Data;
use poem::Response;
use poem::{
    endpoint::StaticFilesEndpoint, get, handler, listener::TcpListener, middleware::Cors,
    web::Html, EndpointExt, Route, Server,
};
use poem_openapi::{OpenApi, OpenApiService, Tags};
use serde_json::{self, Value};
use tracing::info;

use crate::middlewares::tracing::TraceId;
use crate::state::State;

pub async fn serve(state: State) {
    info!("Serving Router");

    let app = Route::new()
        // .nest("/api", api_service)
        // .nest("/", file_endpoint)
        .at("/", get(not_found))
        .with(Cors::new())
        .with(TraceId::new(Arc::new(global::tracer("edgeserver"))))
        .with(OpenTelemetryMetrics::new())
        .data(state);

    let listener = TcpListener::bind("0.0.0.0:3001");

    Server::new(listener).run(app).await.unwrap()
}

#[handler]
async fn not_found() -> Html<&'static str> {
    // inline 404 template
    Html(include_str!("./404.html"))
}
