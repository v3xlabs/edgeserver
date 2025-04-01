use lapin::{
    options::*, publisher_confirm::Confirmation, types::FieldTable, BasicProperties, Channel,
    Connection, ConnectionProperties,
};
use serde::{Deserialize, Serialize};

use crate::state::AMQPConfig;
use tracing::info;

#[derive(Debug)]
pub struct TaskRabbit {
    connection: Connection,
    channel: Channel,

    previews_queue_key: String,
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

        let previews_queue_key = config
            .previews_queue
            .as_deref()
            .unwrap_or("previews")
            .to_string();

        // Declare the screenshots queue
        bunshot_channel
            .queue_declare(
                &previews_queue_key,
                QueueDeclareOptions {
                    durable: true,
                    ..QueueDeclareOptions::default()
                },
                FieldTable::default(),
            )
            .await
            .unwrap();

        info!("Bunshot queue declared");

        TaskRabbit {
            connection,
            channel: bunshot_channel,
            previews_queue_key,
        }
    }

    pub async fn queue_bunshot(&self, site_id: &str, deployment_id: &str, domain: &str) {
        let payload = serde_json::to_string(&BunshotPayload {
            site_id: site_id.to_string(),
            deployment_id: deployment_id.to_string(),
            domain: domain.to_string(),
        })
        .unwrap();

        // Publish to the screenshots queue
        let confirm = self
            .channel
            .basic_publish(
                "",
                &self.previews_queue_key,
                BasicPublishOptions::default(),
                payload.as_bytes(),
                BasicProperties::default().with_delivery_mode(2), // Persistent delivery mode
            )
            .await
            .unwrap()
            .await
            .unwrap();

        if confirm == Confirmation::NotRequested || confirm == Confirmation::Ack(None) {
            info!("Message successfully published to screenshots queue");
        } else {
            info!("Failed to publish message to screenshots queue");
        }
    }
}
