export type TokenV1 = {
    // Token snowflake
    token_id: string;
    // Team snowflake
    team_id: string;

    // Cosmetic
    name: string;

    // Used to check if revoked
    revoked_at: string;

    // Permissions
    permissions: bigint;

    // Site snowflake
    site_id?: string;
};

export type Token = TokenV1;
