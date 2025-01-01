use config::{Config, Environment};
use dotenvy::var;
use serde::Deserialize;

pub struct AppState {
    config: AppConfig,
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
    pub async fn new() -> Result<Self, config::ConfigError> {
        let config = Config::builder()
            .add_source(Environment::default())
            .build()?;

        // Deserialize into the AppConfig struct
        let config: AppConfig = config.try_deserialize()?;

        Ok(Self { config })
    }
}
