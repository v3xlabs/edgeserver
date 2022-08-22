export type ApplicationV1 = {
    app_id: bigint;
    owner_id: bigint;
    permissions: {
        [user_id: string]: string;
    };
};

export type ApplicationV2 = ApplicationV1 & { domain_id: bigint };

export type ApplicationV3 = ApplicationV2 & { name: string };

export type ApplicationV4 = ApplicationV3 & { last_deployed: string };

export type ApplicationV5 = Omit<ApplicationV4, 'permissions'>;

export type Application = ApplicationV5;
