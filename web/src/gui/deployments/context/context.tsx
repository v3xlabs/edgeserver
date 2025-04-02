import { FC } from 'react';

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

    if (parsedContext.contextType === 'github-action') {
        return (
            <GithubDeploymentContext
                context={parsedContext}
                siteId={siteId}
                deploymentId={deploymentId}
            />
        );
    }

    return <div>{JSON.stringify(parsedContext, undefined, 2)}</div>;
};
