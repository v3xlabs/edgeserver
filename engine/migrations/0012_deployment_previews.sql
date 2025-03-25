CREATE TABLE deployment_previews (
    site_id TEXT NOT NULL REFERENCES sites(site_id),
    deployment_id TEXT NOT NULL REFERENCES deployments(deployment_id),
    file_path TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (site_id, deployment_id, file_path)
);
