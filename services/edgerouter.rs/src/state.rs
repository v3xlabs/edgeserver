use opentelemetry::{sdk::{Resource, trace::Tracer}, KeyValue};
use scylla::{ExecutionProfile, Session, SessionBuilder};

use crate::{metrics::Metrics, storage::signalfs::SignalStorage};

use {
    crate::{
        environment::Config,
        metrics,
        storage::{http::HttpStorage, minio::MinioStorage, StorageProviders},
    },
    std::sync::Arc,
};

#[derive(Clone, Debug)]
pub struct AppState {
    pub tracer: Arc<opentelemetry::sdk::trace::Tracer>,
    pub redis: Arc<redis::Client>,
    pub storage: StorageProviders<SignalStorage, MinioStorage, HttpStorage>,
    pub config: Config,
    pub metrics: Metrics,
    pub database: Arc<Session>,
}

impl AppState {
    pub(crate) async fn new(
        config: Config,
        redis: redis::Client,
        tracer: Tracer,
    ) -> Result<AppState, Box<dyn std::error::Error>> {
        let metrics = metrics::Metrics::new(Resource::new(vec![
            KeyValue::new("service_name", "edgerouter.rs"),
            KeyValue::new("service_version", env!("CARGO_PKG_VERSION").to_string()),
        ]))?;

        let minio_storage = config.get_minio_storage()?;
        let http_storage: HttpStorage = Default::default();

        let signal_storage = config.get_signalfs_storage()?;

        let scylla_url = config.scylla_url.as_str();

        let database = crate::database::init::init(scylla_url).await;

        database.query("USE edgeserver", &[]).await?;

        let database = Arc::new(database);

        Ok(AppState {
            tracer: Arc::new(tracer),
            redis: Arc::new(redis),
            storage: StorageProviders {
                signalfs: Some(Arc::new(signal_storage)),
                minio: Some(Arc::new(minio_storage)),
                http: Arc::new(http_storage),
            },
            config,
            metrics,
            database,
        })
    }
}
