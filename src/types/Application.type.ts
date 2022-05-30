type Snowflake = string;
type PermissionsBit = string;

export type ApplicationV1 = {
    app_id: Snowflake;
    owner_id: Snowflake;
    permissions: {
        [user_id: Snowflake]: PermissionsBit;
    };
};
