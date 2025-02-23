use std::sync::Arc;

use async_std::path::Path;
use auth::AuthApi;
use invite::InviteApi;
use opentelemetry::global;
use poem::middleware::OpenTelemetryMetrics;
use poem::{
    endpoint::StaticFilesEndpoint, get, handler, listener::TcpListener, middleware::Cors,
    web::Html, EndpointExt, Route, Server,
};
use poem_openapi::payload::PlainText;
use poem_openapi::{OpenApi, OpenApiService, Tags};
use site::SiteApi;
use team::TeamApi;
use tracing::info;
use user::UserApi;

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

    let app = Route::new()
        .nest("/api", api_service)
        .nest("/openapi.json", spec)
        .at("/docs", get(get_openapi_docs))
        .nest("/", file_endpoint)
        .with(Cors::new())
        .with(TraceId::new(Arc::new(global::tracer("edgeserver"))))
        .with(OpenTelemetryMetrics::new())
        .data(state);

    let listener = TcpListener::bind("0.0.0.0:3000");

    Server::new(listener).run(app).await.unwrap()
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
