use s3::creds::Credentials;
use s3::Bucket;
use s3::Region;

use crate::state::AppConfig;

#[derive(Debug)]
pub struct Storage {
    pub bucket: Box<Bucket>,
}

impl Storage {
    pub fn from_config(config: &AppConfig) -> Self {
        let credentials = Credentials::new(
            Some(&config.s3_access_key),
            Some(&config.s3_secret_key),
            None,
            None,
            None,
        )
        .unwrap();
        let region = Region::Custom {
            region: config.s3_region.clone(),
            endpoint: config.s3_endpoint_url.clone(),
        };
        let bucket = Bucket::new(&config.s3_bucket_name, region, credentials)
            .unwrap()
            .with_path_style();

        Self { bucket }
    }

    pub async fn upload(
        &self,
        name: &str,
        kind: &str,
        file: Vec<u8>,
    ) -> Result<String, anyhow::Error> {
        self.bucket.put_object(&name, &file).await?;

        Ok(name.to_string())
    }
}
