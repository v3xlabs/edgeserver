type Snowflake = string;

export type DeploymentConfigV1 = {
    deploy_id: Snowflake;
    routing: string;
    headers: string;
    redirects: string;
    rewrites: string;
    ssl: string;
};

export type DeploymentConfig = DeploymentConfigV1;
