use poem_openapi::OpenApi;

pub mod accept;
pub mod get;

pub fn api_routes() -> impl OpenApi {
    (get::InviteGetApi, accept::InviteAcceptApi)
}
