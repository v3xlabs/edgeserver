use poem_openapi::Object;
use serde::{Deserialize, Serialize};

// This enables the crate to collect build information at compile time
build_info::build_info!(fn build_info);

#[derive(Debug, Clone, Serialize, Deserialize, Object)]
pub struct BuildInformation {
    pub version: String,
    pub git_commit: Option<String>,
    pub git_branch: Option<String>,
    pub git_tags: Option<Vec<String>>,
    pub build_time: String,
    pub rust_version: String,
}

pub fn build_build_information() -> BuildInformation {
    let info = build_info();

    let (git_commit, git_branch, git_tags) =
        if let Some(git_info) = info.version_control.as_ref().and_then(|v| v.git()) {
            (
                Some(git_info.commit_id.clone()),
                git_info.branch.clone(),
                Some(git_info.tags.clone()),
            )
        } else {
            (None, None, None)
        };

    BuildInformation {
        version: info.crate_info.version.to_string(),
        git_commit,
        git_branch,
        git_tags,
        build_time: info.timestamp.to_rfc3339(),
        rust_version: info.compiler.version.to_string(),
    }
}
