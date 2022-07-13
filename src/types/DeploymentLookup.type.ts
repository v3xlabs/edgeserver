type Snowflake = string;

export type DeploymentLookupV1 = {
    base_url: string; // foo.bar.com
    app_id: bigint;
    deploy_id: bigint;
};

export type DeploymentLookup = DeploymentLookupV1;
