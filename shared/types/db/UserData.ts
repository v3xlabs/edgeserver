export type UserDataV1 = {
    // User (eth) address (eg 0x225f13...c3b5)
    user_id: string;
    // Teams IDs (eg ['123456789'])
    teams: bigint[];
};

export type UserData = UserDataV1;
