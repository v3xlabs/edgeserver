type Snowflake = string;

export type DeploymentLookupV1 = {
    base_url: string; // foo.bar.com
    app_id: Snowflake;
    deploy_id: Snowflake;
};

export type DeploymentLookup = DeploymentLookupV1;
