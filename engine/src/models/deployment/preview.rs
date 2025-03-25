use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use poem_openapi::Object;
use sqlx::FromRow;

use crate::{database::Database, state::State};
#[derive(Debug, Serialize, Deserialize, Object, FromRow)]
pub struct DeploymentPreview {
    pub site_id: String,
    pub deployment_id: String,
    pub file_path: String,
    pub mime_type: String,
    pub created_at: DateTime<Utc>,
}

impl DeploymentPreview {
    pub async fn get_by_deployment_id(db: &Database, site_id: &str, deployment_id: &str) -> Result<Vec<Self>, sqlx::Error> {
        let rows = sqlx::query_as!(
            Self,
            "SELECT * FROM deployment_previews WHERE site_id = $1 AND deployment_id = $2",
            site_id,
            deployment_id
        )
        .fetch_all(&db.pool)
        .await?;

        Ok(rows)
    }

    pub async fn get_by_deployment_id_public(state: &State, site_id: &str, deployment_id: &str) -> Result<Vec<Self>, sqlx::Error> {
        let mut rows = DeploymentPreview::get_by_deployment_id(&state.database, site_id, deployment_id).await?;

        let s3_prefix_url = format!("{}/{}", state.config.s3_previews.as_ref().unwrap().endpoint_url, state.config.s3_previews.as_ref().unwrap().bucket_name);

        for row in rows.iter_mut() {
            row.file_path = format!("{}/{}", s3_prefix_url, row.file_path);
        }

        Ok(rows)
    }
}
