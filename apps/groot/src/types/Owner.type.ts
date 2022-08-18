export type OwnerV1 = {
    user_id: bigint;
    address: string;
};

export type OwnerV2 = OwnerV1 & {
    admin: boolean;
};

export type Owner = OwnerV2;
