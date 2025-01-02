import { Link } from '@tanstack/react-router';
import { FC } from 'react';
import { FiArrowRight } from 'react-icons/fi';

import { Site, useSite } from '@/api';

export const SitePreview: FC<{ site_id?: string; site?: Site }> = ({
    site_id: querySiteId,
    site: querySite,
}) => {
    const site_id = querySiteId ?? querySite?.site_id;

    if (!site_id) return;

    const { data: siteData } = useSite(site_id);
    const site = siteData ?? querySite;

    return (
        <Link
            to="/site/$siteId"
            params={{ siteId: site_id }}
            className="card flex items-center justify-between"
        >
            {site?.name}
            <FiArrowRight />
        </Link>
    );
};
