use s3::creds::Credentials;
use s3::Bucket;
use s3::Region;

use crate::state::AppConfig;

#[derive(Debug)]
pub struct Storage {
    pub bucket: Box<Bucket>,
    pub previews_bucket: Option<Box<Bucket>>,
}

impl Storage {
    pub fn from_config(config: &AppConfig) -> Self {
        let credentials = Credentials::new(
            Some(&config.s3.access_key),
            Some(&config.s3.secret_key),
            None,
            None,
            None,
        )
        .unwrap();
        let region = Region::Custom {
            region: config.s3.region.clone(),
            endpoint: config.s3.endpoint_url.clone(),
        };
        let bucket = Bucket::new(&config.s3.bucket_name, region, credentials)
            .unwrap()
            .with_path_style();

        let previews_bucket = if let Some(previews_config) = &config.s3_previews {
            let preview_region = Region::Custom {
                region: previews_config.region.clone(),
                endpoint: previews_config.endpoint_url.clone(),
            };
            let preview_credentials = Credentials::new(
                Some(&previews_config.access_key),
                Some(&previews_config.secret_key),
                None,
                None,
                None,
            )
            .unwrap();  
            let previews_bucket = Bucket::new(&previews_config.bucket_name, preview_region, preview_credentials)
                .unwrap()
                .with_path_style();

            Some(previews_bucket)
        } else {
            None
        };

        Self { bucket, previews_bucket }
    }

    pub async fn upload(
        &self,
        name: &str,
        _kind: &str,
        file: Vec<u8>,
    ) -> Result<String, color_eyre::eyre::Error> {
        self.bucket.put_object(&name, &file).await?;

        Ok(name.to_string())
    }
}
