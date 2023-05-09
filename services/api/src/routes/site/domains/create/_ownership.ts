import { DB } from '../../../../database/index.js';
import { domainIterate } from '../../../../utils/domainIterate.js';

/**
 * Traverse the domain ownership tree to see if the user trying to add the domain has access to any of its parrents
 */
export const traverseDomainOwnership = async (domain: string, user: string) => {
    const splits = domainIterate(domain);

    // Generate a list of teams that are authorized (or just are already) using parents of this domain
    let teams = await Promise.all(
        splits.map(async (v) => {
            const domain = await DB.selectOneFrom('domains', ['site_id'], {
                domain: v,
            });

            if (!domain) return;

            const site = await DB.selectOneFrom('sites', ['team_id'], {
                site_id: domain.site_id,
            });

            if (!site) return;

            return site.team_id;
        })
    );

    teams = teams.filter((v) => v !== undefined) as string[];

    if (teams.length === 0) return true;

    // Check if the user is a member of any of the teams
    const { teams: user_teams } = await DB.selectOneFrom('users', ['teams'], {
        user_id: user,
    });

    // Check if overlap of user_teams and teams is atleast 1
    return teams.some((v) => user_teams.includes(BigInt(v)));
};
