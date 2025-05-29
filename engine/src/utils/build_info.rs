use poem_openapi::Object;
use serde::{Deserialize, Serialize};

// This enables the crate to collect build information at compile time
build_info::build_info!(fn build_info);

/// `BuildInformation` contains metadata about the build
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

/// Builds a `BuildInformation` struct from environment variables
#[must_use]
pub fn build_build_information() -> BuildInformation {
    let info = build_info();

    let (git_commit, git_branch, git_tags, git_dirty) = info
        .version_control
        .as_ref()
        .and_then(|v| v.git())
        .map_or((None, None, None, false), |git_info| {
            (
                Some(git_info.commit_id.clone()),
                git_info.branch.clone(),
                Some(git_info.tags.clone()),
                git_info.dirty,
            )
        });

    BuildInformation {
        version: info.crate_info.version.to_string(),
        git_commit,
        git_branch,
        git_tags,
        git_dirty,
        build_time: info.timestamp.to_string(),
        rust_version: info.compiler.version.to_string(),
    }
}
