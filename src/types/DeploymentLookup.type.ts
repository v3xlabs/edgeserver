type Snowflake = string;
type PermissionsBit = string;

export type DeploymentLookupV1 = {
    base_url: string; // foo.bar.com
    app_id: Snowflake;
    deploy_id: Snowflake;
};
