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
