use {
    crate::{error::Result, storage::minio::MinioStorage},
    serde::Deserialize,
};

#[derive(Deserialize, Debug, Clone, Eq, PartialEq)]
pub struct Config {
    #[serde(default = "default_port")]
    pub port: u16,
    #[serde(default = "default_redis_url")]
    pub redis_url: String,

    pub minio_url: String,
    pub minio_bucket: String,
}

impl Config {
    pub fn get_minio_storage(&self) -> MinioStorage {
        MinioStorage {
            url: self.minio_url.clone(),
            bucket: self.minio_url.clone(),
        }
    }
}

const DEFAULT_PORT: u16 = 1234;
const DEFAULT_REDIS_URL: &str = "redis://0.0.0.0:6379";

fn default_port() -> u16 {
    DEFAULT_PORT
}

fn default_redis_url() -> String {
    DEFAULT_REDIS_URL.to_string()
}

pub fn get_config() -> Result<Config> {
    let config = envy::from_env::<Config>()?;
    Ok(config)
}
