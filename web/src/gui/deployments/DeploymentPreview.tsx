import { FC } from 'react';

import { Deployment } from '@/api';

export const DeploymentPreview: FC<{
    deployment?: Deployment;
    deployment_id?: string;
    site_id?: string;
}> = ({ deployment, deployment_id }) => {
    return <div className="card">Deployment Preview {deployment_id}</div>;
};
