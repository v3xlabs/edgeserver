use chrono::{DateTime, Utc};
use opentelemetry::Context;
use poem_openapi::{types::{multipart::Upload, Example}, Object};
use serde::{Deserialize, Serialize};
use sqlx::{query, query_as};
use async_zip::base::read::mem::ZipFileReader;
use tracing::{info, info_span};
use tracing_opentelemetry::OpenTelemetrySpanExt;

use crate::{
    assets::AssetFile, database::Database, state::State, utils::id::{generate_id, IdType}
};

pub mod preview;

#[derive(Debug, Serialize, Deserialize, Object)]
#[oai(example)]
pub struct Deployment {
    /// The Deployment ID
    pub deployment_id: String,
    pub site_id: String,
    pub context: Option<String>,
    pub created_at: DateTime<Utc>,
}

impl Example for Deployment {
    fn example() -> Self {
        Self {
            deployment_id: "d_1234567890".to_string(),
            site_id: "s_1234567890".to_string(),
            context: Some("test".to_string()),
            created_at: Utc::now(),
        }
    }
}

#[derive(Debug, Serialize, Deserialize, Object)]
pub struct File {
    pub file_id: i64,
    pub file_hash: String,
    pub file_size: Option<i64>,
    pub file_deleted: bool,
}

#[derive(Debug, Serialize, Deserialize, Object)]
pub struct DeploymentFile {
    pub deployment_id: String,
    pub file_id: i64,
    pub file_path: String,
    pub mime_type: String,
}

impl Deployment {
    pub async fn new(
        db: &Database,
        site_id: String,
        context: Option<String>,
    ) -> Result<Self, sqlx::Error> {
        let span = info_span!("Deployment::new");
        span.set_parent(Context::current());
        let _guard = span.enter();

        let deployment_id: String = generate_id(IdType::DEPLOYMENT);

        query_as!(
            Deployment,
            "INSERT INTO deployments (deployment_id, site_id, context) VALUES ($1, $2, $3) RETURNING *",
            deployment_id,
            site_id,
            context
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

    #[tracing::instrument(name = "upload_files", skip(self, state, file))]
    pub async fn upload_files(&self, state: &State, file: Vec<u8>) -> Result<(), sqlx::Error> {
        let span = info_span!("Deployment::upload_files");
        span.set_parent(Context::current());
        let _guard = span.enter();

        // TODO: Read file stream, extract zip file (contains multiple files), upload each file to s3 at the correct relevant path relative to deployment.deployment_id + '/'

        let zip = ZipFileReader::new(file).await.unwrap();

        for index in 0..zip.file().entries().len() {
            let file = zip.file().entries().get(index).unwrap();
            let path = file.filename().as_str().unwrap();
            let entry_is_dir = file.dir().unwrap();

            if entry_is_dir {
                info!("Skipping directory: {:?}", path);
                continue;
            }

            let mut file_content = zip.reader_with_entry(index).await.unwrap();

            let mut buf = Vec::new();
            file_content.read_to_end_checked(&mut buf).await.unwrap();

            // hash the file
            let (_file, newly_created_file, file_hash, content_type, _file_size) = AssetFile::from_buffer(state, &buf, path).await?;

            info!("Cataloging metadata for file: {:?}", path);
            
            let s = tracing::span!(tracing::Level::INFO, "cataloging_metadata", file_path = path);
            let _enter = s.enter();

            let _deployment_file = query_as!(
                 DeploymentFile,
                "INSERT INTO deployment_files (deployment_id, file_id, file_path, mime_type) VALUES ($1, $2, $3, $4) RETURNING *",
                self.deployment_id,
                newly_created_file.file_id,
                path,
                content_type
            ).fetch_one(&state.database.pool).await?;

            drop(_enter);

            if newly_created_file.is_new.unwrap_or_default() {
                info!("Uploading file: {:?}", path);
                let s = tracing::span!(tracing::Level::INFO, "uploading_file", file_path = path);
                let _enter = s.enter();

                let s3_path = file_hash.to_string();
                state
                    .storage
                    .bucket
                    .put_object_with_content_type(&s3_path, &buf, &content_type)
                    .await
                    .unwrap();

                drop(_enter);

                info!("Upload complete");
            } else {
                info!("File already exists, skipping upload");
            }
        }

        Ok(())
    }

    // Go through all `files` where the `deployment_files` links it to a deployment_id from `deployments` table
    // if the file is not used by deployments > cutoff_date then return the file
    pub async fn cleanup_old_files(
        state: &State,
        cutoff_date: DateTime<Utc>,
    ) -> Result<Vec<File>, sqlx::Error> {
        let span = info_span!("Deployment::cleanup_old_files");
        span.set_parent(Context::current());
        let _guard = span.enter();

        tracing::info!("Checking for unused files before: {:?}", cutoff_date);
        let files = query_as!(
            File,
            r#"
            SELECT DISTINCT f.* 
            FROM files f
            WHERE NOT EXISTS (
                SELECT 1 
                FROM deployment_files df
                JOIN deployments d ON df.deployment_id = d.deployment_id
                WHERE df.file_id = f.file_id 
                AND d.created_at > $1
            ) AND f.file_deleted = FALSE"#,
            cutoff_date
        )
        .fetch_all(&state.database.pool)
        .await?;

        tracing::info!("Found {} unused files", files.len());

        if files.len() > 0 {
            tracing::info!("Deleting {} unused files", files.len());

            // delete file from s3
            for file in &files {
                let s3_path = format!("sites/{}", file.file_hash);
                state.storage.bucket.delete_object(&s3_path).await.unwrap();
            }

            // delete the files from the `files` table
            query!(
                "UPDATE files SET file_deleted = TRUE WHERE file_id = ANY($1)",
                &files.iter().map(|f| f.file_id).collect::<Vec<i64>>()
            )
            .execute(&state.database.pool)
            .await?;
        }

        Ok(files)
    }

    pub async fn get_by_id(db: &Database, deployment_id: &str) -> Result<Self, sqlx::Error> {
        let span = info_span!("Deployment::get_by_id");
        span.set_parent(Context::current());
        let _guard = span.enter();

        query_as!(
            Deployment,
            "SELECT * FROM deployments WHERE deployment_id = $1",
            deployment_id
        )
        .fetch_one(&db.pool)
        .await
    }

    pub async fn update_context(db: &Database, deployment_id: &str, context: &str) -> Result<(), sqlx::Error> {
        let span = info_span!("Deployment::update_context");
        let _guard = span.enter();

        query!(
            "UPDATE deployments SET context = $1 WHERE deployment_id = $2",
            context,
            deployment_id
        )
        .execute(&db.pool)
        .await?;

        Ok(())
    }
}

#[derive(Debug, Serialize, Deserialize, Object)]
pub struct NewlyCreatedFile {
    pub file_id: Option<i64>,
    pub is_new: Option<bool>,
}

impl DeploymentFile {
    pub async fn get_deployment_files(
        db: &Database,
        deployment_id: &str,
    ) -> Result<Vec<DeploymentFileEntry>, sqlx::Error> {
        let span = info_span!("DeploymentFile::get_deployment_files");
        span.set_parent(Context::current());
        let _guard = span.enter();

        query_as!(
            DeploymentFileEntry,
            r#"
            SELECT
                df.deployment_id as "deployment_file_deployment_id!",
                df.file_id as "deployment_file_file_id!",
                df.file_path as "deployment_file_file_path!",
                df.mime_type as "deployment_file_mime_type!",
                f.file_hash as "file_hash!",
                f.file_size,
                f.file_deleted
            FROM deployment_files df
            JOIN files f ON df.file_id = f.file_id
            WHERE df.deployment_id = $1
            "#,
            deployment_id
        )
        .fetch_all(&db.pool)
        .await
    }
}

// Add this new struct to represent the joined result
#[derive(Debug, Serialize, Deserialize, sqlx::FromRow, Object)]
pub struct DeploymentFileEntry {
    pub deployment_file_deployment_id: String,
    pub deployment_file_file_id: i64,
    pub deployment_file_file_path: String,
    pub deployment_file_mime_type: String,
    pub file_hash: String,
    pub file_size: Option<i64>,
    pub file_deleted: bool,
}
