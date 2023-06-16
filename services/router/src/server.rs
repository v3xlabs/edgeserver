use std::{net::SocketAddr, sync::Arc};
use tracing::span;

use hyper::{server::conn::http1, service::service_fn};
use tokio::net::TcpListener;

use crate::{error, info, network, state::AppState};

pub async fn bootstrap(state_arc: Arc<AppState>) {
    let port = state_arc.config.port;

    let addr = SocketAddr::from(([0, 0, 0, 0], port));
    let listener = TcpListener::bind(addr).await.unwrap();

    info!("WebServer listening on {}", addr);

    loop {
        // Pre-clone a reference to the state
        let state_arc = state_arc.clone();
        // Accept a new connection
        let (stream, _) = listener.accept().await.unwrap();

        // Spawn thread for each HTTP request
        tokio::task::spawn(async move {
            let span = span!(tracing::Level::INFO, "http_connection");
            let _guard = span.enter();

            // Handle the connection
            let handle = http1::Builder::new()
                .serve_connection(
                    stream,
                    service_fn(|req| network::handle_svc(req, &state_arc)),
                )
                .await;

            // Log any errors
            if let Err(err) = handle {
                error!("Error serving connection: {:?}", err);
            }
        });
    }
}
