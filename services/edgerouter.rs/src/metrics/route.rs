use std::{sync::Arc, net::{SocketAddr}};

use http::Response;
use hyper::{server::conn::http1, service::service_fn};
use tokio::net::TcpListener;

use crate::{state::AppState, error, info};

pub async fn bootstrap(state_arc: Arc<AppState>) {
    tokio::spawn(async move {
        let addr = SocketAddr::from(([0, 0, 0, 0], 1235));
        let listener = TcpListener::bind(addr).await.unwrap();

        info!("Metrics exposed on {}", addr);

        loop {
            let state_arc = state_arc.clone();

            let (stream, _) = listener.accept().await.unwrap();

            tokio::task::spawn(async move {
                let handle = http1::Builder::new()
                    .serve_connection(
                        stream,
                        service_fn(|_| {
                            let state_arc = state_arc.clone();

                            let metrics = state_arc.metrics.export().unwrap();

                            async move {
                                let response = Response::new(metrics);
                                Ok::<_, hyper::Error>(response)
                            }
                        }),
                    )
                    .await;

                if let Err(err) = handle {
                    error!("Error serving connection: {:?}", err);
                }
            });
        }
    });
}
