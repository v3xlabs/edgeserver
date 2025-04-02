import { Link } from '@tanstack/react-router';
import { FC } from 'react';
import { FiArrowRight, FiGlobe } from 'react-icons/fi';
import { LuLoader } from 'react-icons/lu';

import {
    Site,
    useLastDeployment,
    useLastPreviewDeployment,
    useSite,
} from '@/api';

import { TeamPreview } from '../team/TeamPreview';

export type SitePreviewVariant = 'default' | 'external';

export const SitePreview: FC<{
    site_id?: string;
    site?: Site;
    variant?: SitePreviewVariant;
}> = ({ site_id: querySiteId, site: querySite, variant }) => {
    const site_id = querySiteId ?? querySite?.site_id;
    const { data: deployment } = useLastDeployment(site_id ?? '');
    const { data: previews } = useLastPreviewDeployment(site_id);

    if (!site_id) return;

    const { data: siteData } = useSite(site_id);
    const site = siteData ?? querySite;

    const favicon = <FiGlobe />;

    const isAwaitingPreview =
        previews &&
        previews.length > 0 &&
        deployment &&
        deployment.deployment_id &&
        previews.at(-1)?.deployment_id != deployment.deployment_id;

    return (
        <Link
            to="/site/$siteId"
            params={{ siteId: site_id }}
            className="card block space-y-2"
        >
            {previews && previews.length > 0 && (
                <div className="bg-secondary relative aspect-video h-full min-h-24 overflow-hidden rounded-md border drop-shadow-sm md:max-h-48">
                    <img
                        alt="Deployment Preview"
                        src={previews[0].preview_path}
                        className="size-full object-cover"
                    />
                    {isAwaitingPreview && (
                        <div className="backdrop-blur-xs absolute inset-0 flex items-center justify-center bg-black/10">
                            <LuLoader className="animate-spin" />
                        </div>
                    )}
                </div>
            )}
            <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                    {previews &&
                    previews.length > 0 &&
                    previews[0].favicon_path ? (
                        <div className="flex size-6 items-center justify-center overflow-hidden">
                            <img
                                alt="Deployment Preview"
                                src={previews[0].favicon_path}
                                className="object-fit size-full"
                            />
                        </div>
                    ) : (
                        favicon
                    )}
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
