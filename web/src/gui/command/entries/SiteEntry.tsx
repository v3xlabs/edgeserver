import { useNavigate } from '@tanstack/react-router';
import { Command } from 'cmdk';
import { FC } from 'react';
import { FiGlobe } from 'react-icons/fi';

import {
    useDeploymentPreviews,
    useSite,
    useSiteDeployments,
    useTeam,
    useTeams,
    useTeamSites,
} from '@/api';

export const SiteEntry: FC<{ site_id: string }> = ({ site_id }) => {
    const { data: site } = useSite(site_id);
    const { data: deployments } = useSiteDeployments(site_id);
    const { data: previews } = useDeploymentPreviews(
        site_id,
        deployments?.[0]?.deployment_id ?? ''
    );
    const navigate = useNavigate();

    if (!site) return <></>;

    return (
        <Command.Item
            keywords={[site.name, site.site_id]}
            className="flex items-center justify-between"
            onSelect={() => {
                navigate({
                    to: '/site/$siteId',
                    params: {
                        siteId: site_id,
                    },
                });
            }}
        >
            <div className="flex items-center gap-2">
                {previews && previews.length > 0 && previews[0].favicon_path ? (
                    <img
                        src={previews[0].favicon_path}
                        alt="Favicon"
                        className="size-4 rounded-sm"
                    />
                ) : (
                    <FiGlobe className="text-sm" />
                )}
                <div>{site.name}</div>
            </div>
            <div className="flex items-center gap-1 text-muted">
                <FiGlobe className="text-sm" />
                <span>site</span>
            </div>
        </Command.Item>
    );
};

export const TeamSiteEntries: FC<{ team_id: string }> = ({ team_id }) => {
    const { data: team } = useTeam(team_id);
    const { data: sites } = useTeamSites(team_id);

    if (!team || !sites || sites.length === 0) return <></>;

    return (
        <Command.Group heading={team.name}>
            {sites.map((site) => (
                <SiteEntry key={site.site_id} site_id={site.site_id} />
            ))}
        </Command.Group>
    );
};

export const SiteEntries = () => {
    const { data: teams } = useTeams();

    return (
        <>
            {teams?.map((team) => (
                <TeamSiteEntries key={team.team_id} team_id={team.team_id} />
            ))}
        </>
    );
};
