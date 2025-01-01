use poem_openapi::Object;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Object)]
pub struct Site {
    pub site_id: String,
    pub team_id: String,
    pub name: String,
}
