use car::CarHandler;
use lapin::{Connection, ConnectionProperties};
use preview::PreviewHandler;

use crate::state::{AMQPConfig, AppState};
use tracing::info;

pub mod car;
pub mod preview;

#[derive(Debug)]
pub struct TaskRabbit {
    connection: Connection,

    pub previews: Option<PreviewHandler>,
    pub car: Option<CarHandler>,
}

impl TaskRabbit {
    pub async fn init(config: &AMQPConfig) -> TaskRabbit {
        let connection = Connection::connect(config.addr.as_str(), ConnectionProperties::default())
            .await
            .unwrap();

        info!("Connected to RabbitMQ");

        let previews = PreviewHandler::init(&config, &connection).await;

        let car = CarHandler::init(&config, &connection).await;

        TaskRabbit {
            connection,
            previews,
            car,
        }
    }

    pub async fn do_consume(&self, state: &AppState) {
        if let Some(car) = &self.car {
            car.consume(state).await;
        }
    }
}
