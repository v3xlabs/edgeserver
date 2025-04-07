use crate::state::State;
use crate::utils::build_info::{BuildInformation, build_build_information};
use poem::web::Data;
use poem_openapi::{payload::Json, ApiResponse, Object, OpenApi};
use crate::routes::ApiTags;

pub struct SystemApi;

#[derive(Debug, Clone, Object)]
pub struct IPFSStatus {
    pub public_cluster_url: String,
}

#[derive(ApiResponse)]
pub enum IPFSStatusResponse {
    #[oai(status = 200)]
    Ok(Json<IPFSStatus>),
    #[oai(status = 100)]
    FeatureDisabled(Json<String>),
}

#[derive(ApiResponse)]
pub enum BuildInfoResponse {
    #[oai(status = 200)]
    Ok(Json<BuildInformation>),
}

#[OpenApi]
impl SystemApi {
    #[oai(path = "/system/ipfs", method = "get", tag = "ApiTags::System")]
    async fn status(&self, state: Data<&State>) -> IPFSStatusResponse {
        match &state.ipfs {
            Some(ipfs) => IPFSStatusResponse::Ok(Json(IPFSStatus {
                public_cluster_url: ipfs.public_cluster_url.clone(),
            })),
            None => IPFSStatusResponse::FeatureDisabled(Json("IPFS is not enabled".to_string())),
        }
    }

    #[oai(path = "/system/build", method = "get", tag = "ApiTags::System")]
    async fn build(&self, _state: Data<&State>) -> BuildInfoResponse {
        BuildInfoResponse::Ok(Json(build_build_information()))
    }
}

