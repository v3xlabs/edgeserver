use poem_openapi::Object;
use serde::{Deserialize, Serialize};
use std::env;

#[derive(Debug, Clone, Serialize, Deserialize, Object)]
pub struct BuildInformation {
    pub version: String,
    pub git_commit: Option<String>,
    pub git_branch: Option<String>,
    pub git_tags: Option<Vec<String>>,
    pub git_dirty: bool,
    pub build_time: String,
    pub rust_version: String,
}

pub fn build_build_information() -> BuildInformation {
    BuildInformation {
        version: env::var("CARGO_PKG_VERSION").unwrap_or_else(|_| "unknown".to_string()),
        git_commit: env::var("VERGEN_GIT_SHA").ok(),
        git_branch: env::var("VERGEN_GIT_BRANCH").ok(),
        git_tags: env::var("VERGEN_GIT_DESCRIBE").ok().map(|desc| vec![desc]),
        git_dirty: env::var("VERGEN_GIT_DIRTY").unwrap_or_else(|_| "false".to_string()) == "true",
        build_time: env::var("VERGEN_BUILD_TIMESTAMP").unwrap_or_else(|_| "unknown".to_string()),
        rust_version: env::var("VERGEN_RUSTC_SEMVER").unwrap_or_else(|_| "unknown".to_string()),
    }
}
