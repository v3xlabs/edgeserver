import { FC } from 'react';

import { DeploymentPreviewCover } from '../DeploymentPreviewCover';
import { GithubDeploymentContext, GithubDeploymentContextType } from './github';

type DeploymentContextType = GithubDeploymentContextType;

export const parseDeploymentContext = (
    context: string
): DeploymentContextType => {
    return JSON.parse(context);
};

export const DeploymentContext: FC<{
    context: string;
    siteId: string;
    deploymentId: string;
}> = ({ context, siteId, deploymentId }) => {
    const parsedContext = parseDeploymentContext(context);

    const result =
        parsedContext.contextType === 'github-action' ? (
            <GithubDeploymentContext
                context={parsedContext}
                siteId={siteId}
                deploymentId={deploymentId}
            />
        ) : (
            <div>{JSON.stringify(parsedContext, undefined, 2)}</div>
        );

    return (
        <div className="card no-padding flex gap-4 p-4">
            <div className="">
                <DeploymentPreviewCover
                    siteId={siteId}
                    deploymentId={deploymentId}
                />
            </div>
            {result}
        </div>
    );
};
