import { Link } from '@tanstack/react-router';
import { FC } from 'react';
import { FiFileText, FiGitCommit } from 'react-icons/fi';
import TimeAgo from 'react-timeago-i18n';

import { Deployment, useDeployment } from '@/api';

import { parseDeploymentContext } from './context/context';
import { decorateGithubDeploymentContext } from './context/github';

export const DeploymentPreview: FC<{
    deployment?: Deployment;
    deployment_id?: string;
    site_id?: string;
}> = ({
    deployment: deploymentQuery,
    deployment_id: deploymentIdQuery,
    site_id: siteIdQuery,
}) => {
    const deployment_id = deploymentQuery?.deployment_id ?? deploymentIdQuery;
    const { data: deployment } = useDeployment(
        siteIdQuery ?? '',
        deployment_id ?? ''
    );

    const deploymentContext = deployment?.context
        ? parseDeploymentContext(deployment.context)
        : undefined;

    const githubContext =
        deploymentContext?.contextType === 'github-action'
            ? decorateGithubDeploymentContext(deploymentContext)
            : undefined;

    if (githubContext) {
        return (
            <div className="card flex justify-between gap-4">
                <div className="bg-secondary aspect-video h-full max-h-48 min-h-24 rounded-md drop-shadow-sm"></div>
                <div className="grow py-2">
                    <div>
                        <Link
                            to="/site/$siteId/deployment/$deploymentId"
                            params={{
                                deploymentId: deployment?.deployment_id ?? '',
                                siteId: deployment?.site_id ?? '',
                            }}
                            className="hover:text-link flex w-fit items-center gap-2 hover:underline"
                        >
                            {githubContext.data.commit.message}
                        </Link>
                    </div>
                    <div>
                        <Link
                            to={githubContext.data.commit.url}
                            className="hover:text-link text-muted flex w-fit items-center gap-1 hover:underline"
                            target="_blank"
                        >
                            <FiGitCommit />
                            {githubContext.data.commit.id.slice(0, 7)}
                        </Link>
                        <Link
                            to={githubContext.workflowUrl}
                            className="hover:text-link text-muted flex w-fit items-center gap-1 hover:underline"
                            target="_blank"
                        >
                            <FiFileText />
                            {githubContext.data.workflow}
                        </Link>
                    </div>
                </div>
                <div className="flex flex-col items-end justify-center gap-2">
                    <Link
                        to={githubContext.workflowUrl}
                        className="bg-secondary w-fit rounded-md border px-2 py-0"
                        target="_blank"
                    >
                        {githubContext.data.event} #{' '}
                        {githubContext.data.runNumber}
                    </Link>
                    <Link
                        to={
                            `https://github.com/${githubContext.data.commit.author.username}` as any
                        }
                        className="hover:text-link flex items-center gap-2 hover:underline"
                        target="_blank"
                    >
                        <span>{githubContext.data.commit.author.name}</span>
                        <img
                            src={`https://github.com/${githubContext.data.commit.author.username}.png`}
                            className="size-6 rounded-full"
                            alt={githubContext.data.commit.author.name}
                        />
                    </Link>
                    {/* <div>{githubContext.data.commit.timestamp}</div> */}
                </div>
            </div>
        );
    }

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
