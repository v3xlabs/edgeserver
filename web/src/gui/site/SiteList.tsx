import { FC } from 'react';

import { useSites, useTeamSites } from '@/api';

import { SiteCreateButton } from './SiteCreateButton';
import { SitePreview } from './SitePreview';

export const SiteList: FC<{ teamId?: string; external?: boolean }> = ({
    teamId,
    external,
}) => {
    const { data: sites } = teamId ? useTeamSites(teamId) : useSites();

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <h2 className="h2">Sites</h2>
                {sites?.length != 0 && <SiteCreateButton team_id={teamId} />}
            </div>
            {sites && sites.length > 0 && (
                <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {sites.map((site) => (
                        <li key={site.site_id}>
                            <SitePreview
                                site={site}
                                variant={external ? 'external' : 'default'}
                            />
                        </li>
                    ))}
                </ul>
            )}
            {sites && sites.length === 0 && (
                <div className="flex size-full flex-col items-center justify-center gap-2 rounded-md border border-dashed p-4 text-center">
                    <p>No sites found</p>
                    <SiteCreateButton team_id={teamId} />
                </div>
            )}
        </div>
    );
};
