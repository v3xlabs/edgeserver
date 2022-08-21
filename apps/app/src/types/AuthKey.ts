export type AuthKey = {
    key: string;
    permissions: string;
    state: number;
    last_use: number;
    exp?: number;
    name: string;
    last_use_data: string;
};
