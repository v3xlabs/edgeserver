type Snowflake = string;

export type DomainV1 = {
    domain_id: bigint;
    domain: string; //wip
    user_id: bigint;
    permissions: {
        [key: string]: string;
    };
};

export type Domain = DomainV1;
