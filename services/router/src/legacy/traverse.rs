use std::sync::Arc;

use hyper::body::Bytes;
use opentelemetry::trace::Tracer;

use crate::{
    cache::fastentry::CacheEntry,
    debug,
    state::AppState,
    storage::{signalfs::SignalStorage, Storage},
};

struct SplitName {
    original: String,
    chunks: Vec<u8>,
    current: u8,
}

impl SplitName {
    fn new(name: String) -> Self {
        let chunks: Vec<u8> = name.split('/').map(|x| x.len() as u8).collect();

        let current = chunks.len() as u8;

        Self {
            chunks,
            current,
            original: name,
        }
    }

    fn get_current_path(&mut self) -> Option<String> {
        if self.current == 0 {
            return None;
        }

        let mut end = 0;

        for index in 0..self.current {
            let x = self.chunks[index as usize];
            end += x as usize;
            end += 1;
        }

        end -= 1;

        self.pop_path();

        debug!("Current path: {} of {}", end, self.original);

        Some(self.original[0..end].to_string())
    }

    fn pop_path(&mut self) {
        self.current -= 1;
    }
}

fn gen_in_order(path: &str) -> Vec<String> {
    let mut potentials: Vec<String> = Vec::new();

    let stripped_path = path.strip_suffix(".html").unwrap_or(path);
    // yes this technically makes /.html valid
    let stripped_path = stripped_path.strip_suffix('/').unwrap_or(stripped_path);

    // Bad match but oh well
    if path.contains('.') {
        potentials.push(path.to_string());
    } else if !stripped_path.ends_with('/') {
        potentials.push(format!("{}.html", stripped_path));
    }

    let mut split = SplitName::new(stripped_path.to_string());

    while let Some(current_path) = split.get_current_path() {
        potentials.push(format!("{}/index.html", current_path));
    }

    potentials
}

/**
 * /foo/bar/hello.html -> ['/foo/bar/hello.html', '/foo/bar/index.html', '/foo/index.html', '/index.html']
 * /foo/bar/hello -> ['/foo/bar/hello/index.html', '/foo/bar/hello.html', '/foo/bar/index.html', '/foo/index.html', '/index.html']
 * /foo/bar/index -> ['/foo/bar/index/index.html', '/foo/bar/index.html', '/foo/bar/index.html', '/foo/index.html', '/index.html'] // lmeow innefficient n - 1 possible
 * /foo/bar/index.html -> ['/foo/bar/index.html', '/foo/index.html', '/index.html']
 * /foo/bar/index.png
 */

// This is a port of a legacy implementation of signalfs traversal
pub async fn traverse_signalfs(
    storage: &SignalStorage,
    app_state: Arc<AppState>,
    sid: &str,
    path: &str,
    cx: &opentelemetry::Context,
) -> Option<CacheEntry> {
    let potentials: Vec<String> = gen_in_order(path);
    debug!("All potentials {:?}", potentials);

    // Try out all the potentials, check if they exist in storage, and return the first one that does
    for potential in potentials {
        debug!("Checking potential {}", potential);
        let _span = app_state.tracer.start_with_context(format!("Traversing {}", potential), cx);

        if storage
            .exists(&app_state, (sid.to_string(), potential.to_string()))
            .await
            .unwrap()
        {
            debug!("Found {}", potential);

            drop(_span);
            return Some(CacheEntry::new(
                "".to_string(), // TODO:
                "signalfs".to_string(),
                potential.to_string(),
                Some(sid.to_string()),
            ));
        }

        drop(_span);
    }

    None
}
