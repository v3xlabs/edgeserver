use crate::state::State;
use poem::web::Data;
use poem_openapi::{payload::Json, ApiResponse, Object, OpenApi};

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

#[OpenApi]
impl SystemApi {
    #[oai(path = "/system/ipfs", method = "get")]
    async fn status(&self, state: Data<&State>) -> IPFSStatusResponse {
        match &state.ipfs {
            Some(ipfs) => IPFSStatusResponse::Ok(Json(IPFSStatus {
                public_cluster_url: ipfs.public_cluster_url.clone(),
            })),
            None => IPFSStatusResponse::FeatureDisabled(Json("IPFS is not enabled".to_string())),
        }
    }
}
