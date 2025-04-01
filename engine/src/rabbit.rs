use async_std::stream::StreamExt;
use lapin::{
    options::*, publisher_confirm::Confirmation, types::FieldTable, BasicProperties, Channel,
    Connection, ConnectionProperties,
};
use serde::{Deserialize, Serialize};

use crate::{
    models::deployment::Deployment,
    state::{AMQPConfig, AppState, State},
};
use tracing::info;

#[derive(Debug)]
pub struct TaskRabbit {
    connection: Connection,
    channel: Channel,

    previews_queue_key: String,
    car_queue_key: String,
    car_result_queue_key: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct BunshotPayload {
    pub site_id: String,
    pub deployment_id: String,
    pub domain: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CarRequest {
    pub deployment_id: String,
    pub file_path: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CarResponse {
    pub deployment_id: String,
    pub success: bool,
    pub error: Option<String>,
    pub cid: Option<String>,
    pub file_path: Option<String>,
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

        let car_channel = connection.create_channel().await.unwrap();

        let car_queue_key = config.car_queue.as_deref().unwrap_or("car").to_string();

        car_channel
            .queue_declare(
                &car_queue_key,
                QueueDeclareOptions {
                    durable: true,
                    ..QueueDeclareOptions::default()
                },
                FieldTable::default(),
            )
            .await
            .unwrap();

        let car_result_queue_key = config
            .car_result_queue
            .as_deref()
            .unwrap_or("car_results")
            .to_string();

        car_channel
            .queue_declare(
                &car_result_queue_key,
                QueueDeclareOptions {
                    durable: true,
                    ..QueueDeclareOptions::default()
                },
                FieldTable::default(),
            )
            .await
            .unwrap();

        TaskRabbit {
            connection,
            channel: bunshot_channel,
            previews_queue_key,
            car_queue_key,
            car_result_queue_key,
        }
    }

    pub async fn do_consume(&self, state: &AppState) {
        let mut consumer = self
            .channel
            .basic_consume(
                &self.car_result_queue_key,
                "edgeserver",
                BasicConsumeOptions::default(),
                FieldTable::default(),
            )
            .await
            .unwrap();

        while let Ok(delivery) = consumer.next().await.unwrap() {
            let payload = match serde_json::from_slice::<CarResponse>(&delivery.data) {
                Ok(payload) => payload,
                Err(e) => {
                    tracing::error!("Failed to deserialize car response NACKING: {}", e);
                    delivery.nack(BasicNackOptions::default()).await.unwrap();
                    continue;
                }
            };

            tracing::info!("Received car response: {:?}", payload);

            if let Some(ipfs_cid) = payload.cid {
                Deployment::update_ipfs_cid(&state.database, &payload.deployment_id, &ipfs_cid)
                    .await
                    .ok();
            }

            delivery.ack(BasicAckOptions::default()).await.unwrap();
        }
        tracing::error!("Consumer stream ended");
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

    pub async fn queue_car(&self, request: CarRequest) {
        let payload = serde_json::to_string(&request).unwrap();

        // Publish to the car queue
        let confirm = self
            .channel
            .basic_publish(
                "",
                &self.car_queue_key,
                BasicPublishOptions::default(),
                payload.as_bytes(),
                BasicProperties::default().with_delivery_mode(2),
            )
            .await
            .unwrap()
            .await
            .unwrap();

        if confirm == Confirmation::NotRequested || confirm == Confirmation::Ack(None) {
            info!("Message successfully published to car queue");
        } else {
            info!("Failed to publish message to car queue");
        }
    }
}
