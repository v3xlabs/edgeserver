import { FC, useMemo } from 'react';
import { GitHub } from 'react-feather';
import { Deployment } from 'src/types/Deployment';

type GithubDeployContextType = {
    contextType: 'github-action';
    data: {
        event: string;
        sha: string;
        workflow: string;
        runNumber: number;
        runId: string;
        server_url: string;
        ref: string;
        actor: string;
        sender: string;
        commit: {
            author: {
                email: string;
                name: string;
                username: string;
            };
            committer: {
                email: string;
                name: string;
                username: string;
            };
            distinct: boolean;
            id: string;
            message: string;
            timestamp: string;
            tree_id: string;
            url: string;
        };
    };
};

type UnknownDeployContextType = {
    contextType: 'unknown';
};

type DeployContextType = GithubDeployContextType | UnknownDeployContextType;

export const DeploymentLinkInfo: FC<{
    deployment: Deployment;
}> = ({ deployment }) => {
    const context: DeployContextType = useMemo(
        () =>
            deployment.context
                ? JSON.parse(deployment.context)
                : {
                      contextType: 'unknown',
                  },
        [deployment]
    );

    if (context.contextType === 'github-action') {
        return (
            <div className="flex-1">
                <h3>
                    {context.data?.commit?.message ||
                        'Error Loading Github Context'}
                </h3>

                <p className="text-sm text-neutral-700 dark:text-neutral-300">
                    {context.data.actor}
                </p>

                <a
                    href={context.data?.commit?.url || '#'}
                    className="text-xs text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-500"
                    onClick={(event_) => {
                        event_.preventDefault();
                        window.open(context.data.commit.url);
                    }}
                >
                    <GitHub
                        size={'14px'}
                        style={{ display: 'inline', marginInlineEnd: '4px' }}
                    />
                    #{context.data.sha.slice(0, 7)}
                </a>
            </div>
        );
    }

    return (
        <div className="flex-1">
            <h3>Unknown</h3>
            <p className="text-sm text-neutral-400">
                This deployment does not have a supported context.
            </p>
            <p className="text-sm text-neutral-600">#{deployment.deploy_id}</p>
        </div>
    );
};
