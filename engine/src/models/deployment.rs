use chrono::{DateTime, Utc};
use poem_openapi::Object;
use serde::{Deserialize, Serialize};
use sqlx::query_as;

use crate::{database::Database, utils::id::{generate_id, IdType}};

#[derive(Debug, Serialize, Deserialize, Object)]
pub struct Deployment {
    pub deployment_id: String,
    pub site_id: String,
    pub hash: String,
    pub storage: String,
    pub created_at: DateTime<Utc>,
}

impl Deployment {
    pub async fn new(db: &Database, site_id: String, hash: String, storage: String) -> Result<Self, sqlx::Error> {
        let deployment_id: String = generate_id(IdType::DEPLOYMENT);

        query_as!(
            Deployment,
            "INSERT INTO deployments (deployment_id, site_id, hash, storage) VALUES ($1, $2, $3, $4) RETURNING *",
            deployment_id,
            site_id,
            hash,
            storage
        )
        .fetch_one(&db.pool)
        .await
    }

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
