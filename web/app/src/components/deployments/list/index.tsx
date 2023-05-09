import { FC } from 'react';
import { useDeploys } from 'src/hooks/useDeployments';

import { DeploymentEntry } from './entry';

export const DeploymentList: FC<{ site: string }> = ({ site }) => {
    const { data: deployData } = useDeploys(site);

    return (
        <div>
            {!deployData && <div>Loading...</div>}
            {deployData &&
                (deployData.length > 0 ? (
                    deployData.map((deploy) => (
                        <DeploymentEntry
                            key={deploy.deploy_id}
                            deploy={deploy}
                        />
                    ))
                ) : (
                    <div>No deploys found</div>
                ))}
        </div>
    );
};
