export type TeamV1 = {
    // Snowflake ID
    team_id: string;
    // Team name (eg "V3X Labs", "My Team")
    name: string;
    // Team owner address (eg 0x225f13...c3b5)
    owner: string;
    // Type of team (eg 1 = "Personal", 2 = "Team")
    type: number;
    // Icon URL (eg "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...")
    icon: string;
};

export type TeamV2 = TeamV1 & {
    // Members
    members: string[];
}

export type Team = TeamV1;
