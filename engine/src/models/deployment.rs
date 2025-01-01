use poem_openapi::Object;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Object)]
pub struct Deployment {
    pub deployment_id: String,
    pub site_id: String,
    pub name: String,
    pub storage: String,
}
