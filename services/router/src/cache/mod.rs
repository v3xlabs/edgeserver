use redis::Client;

pub mod fastentry;

pub async fn bootstrap(redis_url: &str) -> Client {
    Client::open(redis_url).expect("Failed to connect to redis")
}
