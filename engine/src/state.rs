use std::sync::Arc;

use color_eyre::eyre::Result;
use figment::{Figment, providers::{Env, Format}};
use serde::Deserialize;

use crate::{cache::Cache, database::Database, storage::Storage};

pub type State = Arc<AppState>;

#[derive(Debug)]
pub struct AppState {
    pub config: AppConfig,
    pub database: Database,
    pub storage: Storage,
    pub cache: Cache,
}

#[derive(Deserialize, Debug)]
pub struct AppConfig {
    /// Information
    pub database_url: String,
    pub s3: S3Config,
    pub s3_previews: Option<S3PreviewsConfig>,
    pub github_app: Option<GithubAppConfig>,
}

#[derive(Deserialize, Debug)]
pub struct S3Config {
    pub endpoint_url: String,
    pub region: String,
    pub bucket_name: String,
    pub access_key: String,
    pub secret_key: String,
}

#[derive(Deserialize, Debug)]
pub struct S3PreviewsConfig {
    pub endpoint_url: String,
    pub region: String,
    pub bucket_name: String,
    pub access_key: String,
    pub secret_key: String,
}

/// Github App Config
/// 
/// Setup your app with Callback URL
/// /api/github/oauth
/// 
/// Setup URL (optional)
/// /github/setup
/// 
/// Webhook URL (optional)
/// /api/github/webhook
#[derive(Deserialize, Debug)]
pub struct GithubAppConfig {
    pub client_id: String,
    pub client_secret: String,
}

impl AppState {
    pub async fn new() -> Result<Self> {
        // let config = Config::builder()
        //     .add_source(Environment::default())
        //     .build()?;

        // Deserialize into the AppConfig struct
        // let config: AppConfig = config.try_deserialize()?;

        let config = Figment::new()
            .merge(Env::prefixed("DATABASE_").map(|key| format!("database_{}", key.as_str().to_lowercase()).into()))
            .merge(Env::prefixed("S3_")
                .map(|key| format!("s3.{}", key.as_str().to_lowercase()).into()))
            .merge(Env::prefixed("S3_PREVIEWS_")
                .map(|key| format!("s3_previews.{}", key.as_str().to_lowercase()).into()))
            .merge(Env::prefixed("GITHUB_APP_")
                .map(|key| format!("github_app.{}", key.as_str().to_lowercase()).into()))
            .extract::<AppConfig>()
            .expect("Failed to load AppConfig configuration");

        let database = Database::new(&config.database_url).await?;

        let storage = Storage::from_config(&config);

        let cache = Cache::default();

        Ok(Self {
            config,
            database,
            storage,
            cache,
        })
    }
}
