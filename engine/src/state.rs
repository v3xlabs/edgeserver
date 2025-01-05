use std::sync::Arc;

use config::{Config, Environment};
use serde::Deserialize;

use crate::{database::Database, storage::Storage};

pub type State = Arc<AppState>;

#[derive(Debug)]
pub struct AppState {
    pub config: AppConfig,
    pub database: Database,
    pub storage: Storage,
}

#[derive(Deserialize, Debug)]
pub struct AppConfig {
    /// Information
    pub database_url: String,
    pub s3_endpoint_url: String,
    pub s3_region: String,
    pub s3_bucket_name: String,
    pub s3_access_key: String,
    pub s3_secret_key: String,
}

impl AppState {
    pub async fn new() -> Result<Self, anyhow::Error> {
        let config = Config::builder()
            .add_source(Environment::default())
            .build()?;

        // Deserialize into the AppConfig struct
        let config: AppConfig = config.try_deserialize()?;

        let database = Database::new(&config.database_url).await?;

        let storage = Storage::from_config(&config);

        Ok(Self { config, database, storage })
    }
}
