use std::process;

use scylla::{ExecutionProfile, SessionBuilder, Session, transport::errors::NewSessionError};

use crate::error;

pub async fn init(scylla_url: &str) -> Session {
    let profile_handle = ExecutionProfile::builder()
        .consistency(scylla::statement::Consistency::One)
        .build();

    let database = SessionBuilder::new()
        .default_execution_profile_handle(profile_handle.into_handle())
        .known_node(scylla_url)
        .build()
        .await;

    match database {
        Ok(database) => database,
        Err(err) => {
            match err {
                NewSessionError::IoError(err) => {
                    error!("Failed to connect to scylla database: '{}' {}", scylla_url, err);

                    process::exit(0);
                }
                _ => {
                    error!("Failed to connect to database: {}", err);

                    process::exit(0);
                }
            }
        },
    }
}
