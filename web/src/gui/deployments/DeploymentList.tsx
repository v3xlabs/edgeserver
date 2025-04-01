import { Link } from '@tanstack/react-router';
import { FC } from 'react';
import { FiArrowRight } from 'react-icons/fi';

import { useSiteDeployments } from '@/api';

import { DeploymentPreview } from './DeploymentPreview';

export const DeploymentList: FC<{
    siteId?: string;
    max?: number;
    showHeader?: boolean;
}> = ({ siteId, max, showHeader = true }) => {
    const { data: deployments } = useSiteDeployments(siteId);

    const maxEntries = max ?? deployments?.length ?? 10;

    if (!siteId) return;

    return (
        <div className="space-y-2">
            {showHeader && (
                <div className="flex items-center justify-between">
                    <h2 className="h2">Deployment List</h2>
                    {max && max > 0 && (
                        <Link
                            to="/site/$siteId/deployments"
                            params={{ siteId: siteId ?? '' }}
                            className="link flex items-center gap-1"
                        >
                            View More <FiArrowRight />
                        </Link>
                    )}
                </div>
            )}
            {deployments && deployments.length > 0 && (
                <ul className="space-y-2">
                    {deployments.slice(0, maxEntries).map((deployment) => (
                        <li key={deployment.deployment_id}>
                            <DeploymentPreview
                                deployment={deployment}
                                deployment_id={deployment.deployment_id}
                                site_id={deployment.site_id}
                            />
                        </li>
                    ))}
                </ul>
            )}
            {deployments && deployments.length === 0 && (
                <div className="flex size-full flex-col items-center justify-center gap-2 rounded-md border border-dashed p-4 text-center">
                    <p>No deployments found</p>
                </div>
            )}
        </div>
    );
};
