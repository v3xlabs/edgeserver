export type AuthKeyV1 = {
    key: string;
    owner_id: bigint;
};

export type AuthKeyV2 = AuthKeyV1 & {
    permissions: string; // permissions field
    state: number; // 0 for disabled, 1 for enabled
    last_use: number; // timestamp
};

export type AuthKeyV3 = AuthKeyV2 & { name: string; last_use_data: string };
export type AuthKeyV4 = Omit<AuthKeyV3, 'permissions'> & {
    permissions: bigint;
};

export type RedisAuthKey = AuthKeyV4 & { exp: string };

export type AuthKey = AuthKeyV4 | RedisAuthKey;

export type JWTAuthKey = {
    key: string;
    owner_id: string;
    instance_id: string;
    app_id?: string;
};
