use std::convert::Infallible;

use crate::{storage::signalfs::SignalStorage, error};

use {
    crate::storage::minio::MinioStorage,
    serde::Deserialize,
};

#[derive(Deserialize, Debug, Clone, Eq, PartialEq)]
pub struct Config {
    #[serde(default = "default_port")]
    pub port: u16,

    // Redis
    #[serde(default = "default_redis_url")]
    pub redis_url: String,
    
    // Database URL
    pub scylla_url: String,
    
    // Jaeger tracing URL
    pub jaeger_url: String,
    
    // Minio URL & Bucket
    pub minio_url: Option<String>,
    pub minio_bucket: Option<String>,
    
    // SignalFS storage URL
    pub signalfs_url: Option<String>,

}

impl Config {
    pub fn get_minio_storage(&self) -> Result<MinioStorage, Infallible> {
        let minio_url = self.minio_url.clone().expect("No MINIO_URL env found");
        let minio_bucket = self.minio_bucket.clone().expect("No MINIO_BUCKET env found");

        Ok(MinioStorage {
            url: minio_url,
            bucket: minio_bucket,
        })
    }

    pub fn get_signalfs_storage(&self) -> Result<SignalStorage, Infallible> {
        let signalfs_url = self.signalfs_url.clone().expect("No SIGNALFS_URL env found");

        Ok(SignalStorage { url: signalfs_url })
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

pub fn get_config() -> Config {
    match envy::from_env::<Config>() {
        Ok(config) => {
            crate::info!("Successfully loaded environment configuration.");

            config
        },
        Err(error) => match error {
            envy::Error::MissingValue(v) => {
                error!("Missing environment variable {}", v.to_uppercase());

                std::process::exit(1);
            }
            _ => {
                error!("Error loading environment variables: {}", error);

                std::process::exit(1);
            }
        },
    }
}
