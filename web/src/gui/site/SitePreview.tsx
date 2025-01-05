import { Link } from '@tanstack/react-router';
import { FC } from 'react';
import { FiArrowRight, FiGlobe } from 'react-icons/fi';

import { Site, useSite } from '@/api';

import { TeamPreview } from '../team/TeamPreview';

export type SitePreviewVariant = 'default' | 'external';

export const SitePreview: FC<{
    site_id?: string;
    site?: Site;
    variant?: SitePreviewVariant;
}> = ({ site_id: querySiteId, site: querySite, variant }) => {
    const site_id = querySiteId ?? querySite?.site_id;

    if (!site_id) return;

    const { data: siteData } = useSite(site_id);
    const site = siteData ?? querySite;

    const favicon = <FiGlobe />;

    return (
        <Link
            to="/site/$siteId"
            params={{ siteId: site_id }}
            className="card block space-y-2"
        >
            <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                    {favicon}
                    {site?.name}
                </div>
                <FiArrowRight />
            </div>
            {variant === 'external' && (
                <div className="flex justify-end">
                    <TeamPreview team_id={site?.team_id} variant="compact" />
                </div>
            )}
        </Link>
    );
};
