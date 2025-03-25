use lapin::{
    options::*, publisher_confirm::Confirmation, types::FieldTable, BasicProperties, Channel,
    Connection, ConnectionProperties, Queue, Result,
};
use serde::{Deserialize, Serialize};

use crate::state::AMQPConfig;
use tracing::info;

#[derive(Debug)]
pub struct TaskRabbit {
    connection: Connection,
    channel: Channel,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct BunshotPayload {
    pub site_id: String,
    pub deployment_id: String,
    pub domain: String,
}

impl TaskRabbit {
    pub async fn init(config: &AMQPConfig) -> TaskRabbit {
        let connection = Connection::connect(config.addr.as_str(), ConnectionProperties::default())
            .await
            .unwrap();

        info!("Connected to RabbitMQ");

        let bunshot_channel = connection.create_channel().await.unwrap();

        info!("Bunshot queue declared");

        TaskRabbit {
            connection,
            channel: bunshot_channel,
        }
    }

    pub async fn queue_bunshot(&self, site_id: &str, deployment_id: &str, domain: &str) {
        let payload = serde_json::to_string(&BunshotPayload {
            site_id: site_id.to_string(),
            deployment_id: deployment_id.to_string(),
            domain: domain.to_string(),
        }).unwrap();

        self.channel.basic_publish(
            "bunshot",
            "bunshot",
            BasicPublishOptions::default(),
            payload.as_bytes(),
            BasicProperties::default(),
        ).await.unwrap();
    }
}
