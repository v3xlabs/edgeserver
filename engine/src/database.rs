use sqlx::{
    postgres::{PgConnectOptions, PgPoolOptions},
    ConnectOptions, PgPool,
};
use tracing::info;

#[derive(Debug)]
pub struct Database {
    pub pool: PgPool,
}

impl Database {
    pub async fn new(url: &str) -> Result<Self, sqlx::Error> {
        let mut options: PgConnectOptions = url.parse().unwrap();

        options = options.log_statements(tracing_log::log::LevelFilter::Trace);

        let pool = PgPoolOptions::new()
            .max_connections(5)
            .before_acquire(|conn, _meta| Box::pin(async move {
                info!("Before Acquire");
                Ok(true)
            }))
            .after_connect(|conn, _meta| Box::pin(async move {
                info!("After Connect");
                
                Ok(())
            }))
            .connect_with(options)
            .await?;

        // Initialization code here
        let s = Self { pool };

        s.init().await?;

        info!("Database initialized");

        Ok(s)
    }

    pub async fn init(&self) -> Result<(), sqlx::Error> {
        let migrations = sqlx::migrate!();

        migrations.run(&self.pool).await?;

        Ok(())
    }
}
