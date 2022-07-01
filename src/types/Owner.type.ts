export type OwnerV1 = {
    user_id: string;
    address: string;
};

export type OwnerV2 = OwnerV1 & {
    admin: boolean;
};

export type Owner = OwnerV2;
