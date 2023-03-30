use {
    crate::{
        environment::Config,
        log,
        storage::{http::HttpStorage, minio::MinioStorage, StorageProviders},
    },
    std::sync::Arc,
};

#[derive(Clone, Debug)]
pub struct AppState {
    pub tracer: Arc<opentelemetry::sdk::trace::Tracer>,
    pub redis: Arc<redis::Client>,
    pub storage: StorageProviders<MinioStorage, HttpStorage>,
    pub config: Config,
}

impl AppState {
    pub(crate) fn new(config: Config, redis: redis::Client) -> AppState {
        let tracer = log::init();

        let minio_storage = config.get_minio_storage();
        let http_storage: HttpStorage = Default::default();

        AppState {
            tracer: Arc::new(tracer),
            redis: Arc::new(redis),
            storage: StorageProviders {
                minio: Some(Arc::new(minio_storage)),
                http: Arc::new(http_storage),
            },
            config,
        }
    }
}
