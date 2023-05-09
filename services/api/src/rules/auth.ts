import { DB } from '../database/index.js';

export const hasUserAccessToSite = async (site_id: string, user_id: string) => {
    const site = await DB.selectOneFrom('sites', ['team_id'], {
        site_id,
    });

    if (!site) return false;

    const user_in_team = await DB.selectOneFrom('users', ['teams'], {
        user_id: user_id,
    });

    if (!user_in_team || !user_in_team.teams.includes(BigInt(site.team_id)))
        return false;

    return true;
};
