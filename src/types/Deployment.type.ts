type Snowflake = string;
type PermissionsBit = string;

export type DeploymentV1 = {
    app_id: Snowflake;
    deploy_id: Snowflake;
    created_on: string;
};
