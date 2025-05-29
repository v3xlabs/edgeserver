use lapin::{
    options::{BasicPublishOptions, QueueDeclareOptions},
    publisher_confirm::Confirmation,
    types::FieldTable,
    BasicProperties, Channel, Connection,
};
use serde::{Deserialize, Serialize};
use tracing::info;

use crate::state::AMQPConfig;

#[derive(Debug, Serialize, Deserialize)]
pub struct BunshotPayload {
    pub site_id: String,
    pub deployment_id: String,
    pub domain: String,
}

#[derive(Debug)]
pub struct PreviewHandler {
    channel: Channel,
    queue_key: String,
}

impl PreviewHandler {
    pub async fn init(config: &AMQPConfig, connection: &Connection) -> Option<Self> {
        let channel = connection.create_channel().await.unwrap();

        let queue_key = config
            .previews_queue
            .as_deref()
            .unwrap_or("previews")
            .to_string();

        channel
            .queue_declare(
                &queue_key,
                QueueDeclareOptions {
                    durable: true,
                    ..QueueDeclareOptions::default()
                },
                FieldTable::default(),
            )
            .await
            .unwrap();

        Some(Self { channel, queue_key })
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
                &self.queue_key,
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
