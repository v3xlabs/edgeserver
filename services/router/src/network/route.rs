use {
    crate::{
        cache,
        cache::fastentry::{generate_compound_cache_key, CacheEntry},
        AppState,
        RequestData,
    },
    http::{Request, Response},
    http_body_util::Full,
    hyper::body::{Bytes, Incoming},
    opentelemetry::{
        trace::{Span, TraceContextExt, Tracer},
        Context,
        KeyValue,
    },
    std::sync::Arc,
};

pub async fn handle(
    req: Request<Incoming>,
    data: RequestData,
    span: opentelemetry::sdk::trace::Span,
    state: Arc<AppState>,
) -> Result<(Response<Full<Bytes>>, Context), hyper::Error> {
    let cx = Context::current_with_span(span);

    let key = generate_compound_cache_key(&data.host, req.uri().to_string().as_str(), "http").await;

    println!("{}", key);

    let entry = {
        let _span = state.tracer.start_with_context("Check Cache", &cx);

        cache::fastentry::get_entry(state.redis.clone(), key.as_str())
            .await
            .unwrap()
    };

    if entry.is_some() {
        println!("FastCache exists, using quick response.");

        cx.span()
            .set_attribute(KeyValue::new("fastcache".to_string(), "true".to_string()));

        let entry = entry.unwrap();

        let file_stream = {
            let mut span2 = state.tracer.start_with_context("Request File", &cx);

            span2.set_attribute(KeyValue::new("url".to_string(), entry.location.to_string()));

            println!("Requesting file from {}", entry.location);

            state
                .storage
                .request(&state, &entry.fs, &entry.location)
                .await
                .unwrap()
        };

        return Ok((Response::new(Full::new(file_stream)), cx));
    }

    //
    crate::legacy::serve().await;

    let learned_entry = CacheEntry::new(
        "localhost:1234/".to_string(),
        "minio".to_string(),
        "index.html".to_string(),
    );

    let entry = learned_entry.clone();

    let _span = state.tracer.start_with_context("Set Cache (Async)", &cx);
    let temp_redis = state.redis.clone();
    tokio::spawn(async move {
        crate::cache::fastentry::set_entry(temp_redis, key.as_str(), entry)
            .await
            .unwrap();

        drop(_span);
    });

    // Request the file from learned_entry.loc using reqwest streams and return it
    // as response.
    let file_stream = {
        let _span = state.tracer.start_with_context("Request File", &cx);

        let client = reqwest::Client::new();
        let res = client
            .get(learned_entry.location.as_str())
            .send()
            .await
            .unwrap();

        res.bytes().await.unwrap()
    };

    Ok((Response::new(Full::new(file_stream)), cx))
}
