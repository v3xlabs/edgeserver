export type DeploymentV1 = {
    // SHA of the commit or custom value
    deploy_id: string;
    // Snowflake ID
    site_id: string;
    // Timestamp
    created_at: string;
};

// TODO: Github, Gitlab, etc Context

export type Deployment = DeploymentV1;
