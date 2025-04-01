use async_std::stream::StreamExt;
use lapin::{
    options::{BasicAckOptions, BasicConsumeOptions, BasicNackOptions, BasicPublishOptions, QueueDeclareOptions},
    publisher_confirm::Confirmation,
    types::FieldTable,
    BasicProperties, Channel, Connection,
};
use serde::{Deserialize, Serialize};
use tracing::info;

use crate::{models::deployment::Deployment, state::{AMQPConfig, AppState}};

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

#[derive(Debug)]
pub struct CarHandler {
    channel: Channel,
    // Queue key for the car generation
    // we publish to this queue to start the car generation
    generation_key: String,
    // Queue key for the car result
    // we consume from this queue to get the car result (car file & cid)
    result_key: String,
}

impl CarHandler {
    pub async fn init(config: &AMQPConfig, connection: &Connection) -> Option<CarHandler> {
        let channel = connection.create_channel().await.unwrap();

        let generation_key = config.car_queue.as_deref().unwrap_or("car").to_string();

        let result_key = config
            .car_result_queue
            .as_deref()
            .unwrap_or("car_results")
            .to_string();

        channel
            .queue_declare(
                &generation_key,
                QueueDeclareOptions {
                    durable: true,
                    ..QueueDeclareOptions::default()
                },
                FieldTable::default(),
            )
            .await
            .unwrap();

        channel
            .queue_declare(
                &result_key,
                QueueDeclareOptions {
                    durable: true,
                    ..QueueDeclareOptions::default()
                },
                FieldTable::default(),
            )
            .await
            .unwrap();

        Some(CarHandler {
            channel,
            generation_key,
            result_key,
        })
    }

    pub async fn consume(&self, state: &AppState) {
        let mut consumer = self
            .channel
            .basic_consume(
                &self.result_key,
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

            // if let Some(file_path) = payload.file_path {
            //     // todo pin file using ipfs-cluster

            //     const ipfs_cluster_url = "http://0.0.0.0:44685";

            //     // download from ipfs

            //     // POST /add?local=true&format=car
            //     // form-data, file: deploy.car                
            // }

            delivery.ack(BasicAckOptions::default()).await.unwrap();
        }
        tracing::error!("Consumer stream ended");
    }

    //

    pub async fn queue_car(&self, request: CarRequest) {
        let payload = serde_json::to_string(&request).unwrap();

        // Publish to the car queue
        let confirm = self
            .channel
            .basic_publish(
                "",
                &self.generation_key,
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
