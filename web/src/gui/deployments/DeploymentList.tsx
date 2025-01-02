import { FC } from 'react';

import { useSiteDeployments } from '@/api';

import { DeploymentPreview } from './DeploymentPreview';

export const DeploymentList: FC<{ siteId?: string }> = ({ siteId }) => {
    const { data: deployments } = useSiteDeployments(siteId);

    return (
        <div className="space-y-2">
            <h2 className="h2">Deployment List</h2>
            {deployments && deployments.length > 0 && (
                <ul>
                    {deployments.map((deployment) => (
                        <li key={deployment.deployment_id}>
                            <DeploymentPreview deployment={deployment} />
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
