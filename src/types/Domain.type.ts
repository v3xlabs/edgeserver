type Snowflake = string;
type PermissionsBit = string;

export type DomainV1 = {
    domain_id: Snowflake;
    domain: string; //wip
    user_id: Snowflake;
    permissions: {
        [key: string]: string;
    };
};
