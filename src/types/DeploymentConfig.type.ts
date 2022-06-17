type Snowflake = string;

export type DeploymentConfigV1 = {
    deploy_id: Snowflake;
    config: string;
};

export type DeploymentConfig = DeploymentConfigV1;
