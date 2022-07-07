export type AuthKeyV1 = {
    key: string;
    owner_id: string;
};

export type AuthKeyV2 = AuthKeyV1 & {
    permissions: string; // permissions field
    state: number; // 0 for disabled, 1 for enabled
    last_use: number; // timestamp
};

export type AuthKeyV3 = AuthKeyV2 & { name: string; last_use_data: string };

export type RedisAuthKey = AuthKeyV3 & { exp: string };

export type AuthKey = AuthKeyV3 | RedisAuthKey;

export type JWTAuthKey = {
    key: string;
    owner_id: string;
    instance_id: string;
    app_id?: string;
};
