type Snowflake = string;
type PermissionsBit = string;

export type ApplicationV1 = {
    app_id: Snowflake;
    owner_id: Snowflake;
    permissions: {
        [user_id: Snowflake]: PermissionsBit;
    };
};

export type ApplicationV2 = ApplicationV1 & { domain_id: Snowflake };

export type ApplicationV3 = ApplicationV2 & { name: string };
