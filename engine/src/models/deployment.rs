use chrono::{DateTime, Utc};
use poem_openapi::Object;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Object)]
pub struct Deployment {
    pub deployment_id: String,
    pub site_id: String,
    pub hash: String,
    pub storage: String,
    pub created_at: DateTime<Utc>,
}

impl Deployment {
    // pub fn new(deployment_id: String, site_id: String, hash: String, storage: String) -> Self {
    //     Self {
    //         deployment_id,
    //         site_id,
    //         hash,
    //         storage,
    //         created_at: Utc::now(),
    //     }
    // }
}
