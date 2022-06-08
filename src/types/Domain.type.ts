type Snowflake = string;

export type DomainV1 = {
    domain_id: Snowflake;
    domain: string; //wip
    user_id: Snowflake;
    permissions: {
        [key: string]: string;
    };
};

export type Domain = DomainV1;
