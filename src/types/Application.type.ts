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

export type ApplicationV4 = ApplicationV3 & { last_deployed: string };

export type ApplicationV5 = Omit<ApplicationV4, 'permissions'>;

export type Application = ApplicationV5;
