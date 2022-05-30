type Snowflake = string;
type PermissionsBit = string;

export type DeploymentV1 = {
    app_id: Snowflake;
    deploy_id: Snowflake;
    created_on: string;
};

export type DeploymentV2 = Omit<DeploymentV1, 'created_on'> & {
    timestamp: string;
    cid: string;
    sid: string;
};
