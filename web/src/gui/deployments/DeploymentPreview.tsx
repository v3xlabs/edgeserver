import { Link } from '@tanstack/react-router';
import { FC, useEffect, useState } from 'react';
import {
    FiCheckCircle,
    FiClock,
    FiFileText,
    FiGitCommit,
    FiUpload,
} from 'react-icons/fi';
import TimeAgo from 'react-timeago-i18n';
import { match } from 'ts-pattern';

import { Deployment, useDeployment } from '@/api';
import { secondsToDuration } from '@/util/time';

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
            <div className="card flex flex-wrap justify-stretch gap-4">
                <Link
                    to="/site/$siteId/deployment/$deploymentId"
                    params={{
                        deploymentId: deployment?.deployment_id ?? '',
                        siteId: deployment?.site_id ?? '',
                    }}
                    className="block h-fit w-full cursor-pointer md:h-full md:w-fit"
                >
                    <div className="bg-secondary aspect-video h-full min-h-24 rounded-md drop-shadow-sm md:max-h-48"></div>
                </Link>
                <div className="w-full py-2 md:w-fit md:grow">
                    <div className="flex w-fit items-center gap-2">
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
                        {githubContext.data.workflow_status &&
                            match(githubContext.data.workflow_status)
                                .with('pre', () => (
                                    <FiClock className="text-yellow-500" />
                                ))
                                .with('push', () => (
                                    <FiUpload className="text-blue-400" />
                                ))
                                .with('post', () => (
                                    <FiCheckCircle className="text-green-500" />
                                ))
                                .otherwise((status) => <div>{status}?</div>)}
                    </div>
                    <div className="w-fit">
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
                        {githubContext.duration &&
                            match(githubContext.duration)
                                .with({ type: 'completed' }, (duration) => (
                                    <div className="text-muted flex items-center gap-1">
                                        <FiClock />
                                        {secondsToDuration(duration.duration)}
                                    </div>
                                ))
                                .with({ type: 'pending' }, (duration) => (
                                    <div className="text-muted flex animate-pulse items-center gap-1">
                                        <FiClock className="animate-spin" />
                                        <LiveAgo
                                            date={new Date(duration.startedAt)}
                                        />
                                    </div>
                                ))
                                .otherwise(() => <></>)}
                    </div>
                </div>
                <div className="flex flex-col items-end justify-center gap-2 ">
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
                    {githubContext.data.commit.timestamp && (
                        <div className="text-muted">
                            <TimeAgo
                                date={
                                    new Date(
                                        githubContext.data.commit.timestamp
                                    )
                                }
                                formatOptions={{
                                    numeric: 'always',
                                    style: 'long',
                                }}
                            />
                        </div>
                    )}

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

const LiveAgo: FC<{ date: Date }> = ({ date }) => {
    const [time, setTime] = useState(date);

    useEffect(() => {
        const interval = setInterval(() => {
            setTime(new Date());
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    const ago = secondsToDuration(
        Math.floor((Date.now() - date.getTime()) / 1000)
    );

    return <>{ago}</>;
};
