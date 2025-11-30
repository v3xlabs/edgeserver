use std::fmt::Debug;

use poem_openapi::Object;
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};
use sqlx::query_as;
use tracing::info;

use crate::{models::deployment::NewlyCreatedFile, state::State};

#[derive(Serialize, Deserialize, Debug, Object)]
pub struct AssetFile {
    pub path: String,
}

impl From<String> for AssetFile {
    fn from(path: String) -> Self {
        Self { path }
    }
}

impl AssetFile {
    #[tracing::instrument(name = "from_buffer", skip(state, buffer))]
    pub async fn from_buffer(state: &State, buffer: &[u8], path: impl AsRef<str> + Debug) -> Result<(Self, NewlyCreatedFile, String, String, i64), sqlx::Error> {
        let file_hash = hash_file(&buffer);
        let content_type = infer::get(&buffer)
            .map(|t| t.mime_type().to_string()).unwrap_or_else(|| {
                content_type_from_file_name(path.as_ref())
            });

        let file_size = buffer.len() as i64;

        let newly_created_file = query_as!(
                NewlyCreatedFile,
                r#"
                WITH ins AS (
      INSERT INTO files (file_hash, file_size)
      VALUES ($1, $2)
      ON CONFLICT (file_hash) DO NOTHING
      RETURNING file_id, true AS is_new
    )
    SELECT file_id, is_new
    FROM ins
    UNION ALL
    SELECT file_id, false AS is_new
    FROM files
    WHERE file_hash = $1
    LIMIT 1;
                "#,
                &file_hash,
                file_size
            )
            .fetch_one(&state.database.pool)
            .await?;

        tracing::info!("File: {:?}", newly_created_file);

        let file = AssetFile {
            path: file_hash.to_string()
        };

        Ok((file, newly_created_file, file_hash, content_type, file_size))
    }
}

#[tracing::instrument(name = "hash_file", skip(file))]
fn hash_file(file: &[u8]) -> String {
    let mut hasher = Sha256::new();
    hasher.update(file);
    let hash = hasher.finalize();
    format!("{:x}", hash)
}

fn content_type_from_file_name(file_name: &str) -> String {
    let extension = file_name.split('.').last().unwrap_or_default();

    info!("Content type from file name: {:?}", extension);

    match extension {
        "js" => "text/javascript".to_string(),
        "css" => "text/css".to_string(),
        "json" => "application/json".to_string(),
        "svg" => "image/svg+xml".to_string(),
        "png" => "image/png".to_string(),
        "jpg" => "image/jpeg".to_string(),
        "jpeg" => "image/jpeg".to_string(),
        "gif" => "image/gif".to_string(),
        "ico" => "image/x-icon".to_string(),
        "webp" => "image/webp".to_string(),
        "woff" => "font/woff".to_string(),
        "woff2" => "font/woff2".to_string(),
        "ttf" => "font/ttf".to_string(),
        "otf" => "font/otf".to_string(),
        _ => {
            info!("Unknown file extension: {:?}", extension);
            "application/octet-stream".to_string()
        },
    }
}
