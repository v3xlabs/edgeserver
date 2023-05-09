export type SiteV1 = {
    // Snowflake ID
    site_id: string;
    // Site name (eg "Personal Site", "swag staging")
    name: string;
    // Team ID (snowflake)
    team_id: string;
    // Latest deployment ID (snowflake)
    last_deploy_id: string;
};

export type Site = SiteV1;
