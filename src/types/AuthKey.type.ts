export type AuthKeyV1 = {
    key: string;
    owner_id: string;
};

export type AuthKeyV2 = AuthKeyV1 & {
    permissions: string; // permissions field
    state: number; // 0 for disabled, 1 for enabled
    last_use: number; // timestamp
};

export type JWTAuthKey = {
    key: string;
    owner_id: string;
    instance_id: string;
    app_id?: string;
};

export type AuthKey = AuthKeyV2;
