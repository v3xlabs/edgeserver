import { Link } from '@tanstack/react-router';
import { FC } from 'react';
import TimeAgo from 'react-timeago-i18n';

import { Deployment } from '@/api';

export const DeploymentPreview: FC<{
    deployment?: Deployment;
    deployment_id?: string;
    site_id?: string;
}> = ({ deployment: deploymentQuery, deployment_id: deploymentIdQuery }) => {
    const deployment_id = deploymentQuery?.deployment_id ?? deploymentIdQuery;
    const deployment = deploymentQuery;

    return (
        <div className="card flex justify-between">
            <div>
                <div>{deployment_id}</div>
                <div>{deployment?.deployment_id}</div>
                <Link
                    to="/site/$siteId/deployment/$deploymentId"
                    params={{
                        deploymentId: deployment?.deployment_id ?? '',
                        siteId: deployment?.site_id ?? '',
                    }}
                >
                    View
                </Link>
            </div>
            <div>
                {deployment?.created_at && (
                    <TimeAgo date={new Date(deployment.created_at)} />
                )}
            </div>
        </div>
    );
};
