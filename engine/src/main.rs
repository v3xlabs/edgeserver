use tracing::info;


#[async_std::main]
async fn main() {
    println!("Hello, world!");

    tracing_subscriber::fmt::init();

    info!("Starting Edgerouter");
}
