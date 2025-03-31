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
        let mut opts: PgConnectOptions = url.parse()?;
        let mut opts = opts.log_statements(log::LevelFilter::Trace);
        // let mut opts = opts.log_statements(tracing::LevelFilter::TRACE);
        let pool = PgPoolOptions::new()
            .max_connections(5)
            .connect_with(opts)
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
