import { Link } from '@tanstack/react-router';
import { FC } from 'react';
import { FiClock, FiFileText, FiGitCommit } from 'react-icons/fi';
import TimeAgo from 'react-timeago-i18n';
import { match } from 'ts-pattern';

import {
    Deployment,
    useDeployment,
    useDeploymentPreviews,
    useLastPreviewDeployment,
} from '@/api';
import { startsWithEmoji } from '@/util/emoji';
import { LiveAgo, secondsToDuration } from '@/util/time';

import { parseDeploymentContext } from './context/context';
import { decorateGithubDeploymentContext } from './context/github';
import { WorkflowStatusIndicator } from './WorkflowStatusIndicator';

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

    const { data: previews } = deployment_id
        ? useDeploymentPreviews(siteIdQuery ?? '', deployment_id ?? '')
        : useLastPreviewDeployment(siteIdQuery ?? '');

    const deploymentContext = deployment?.context
        ? parseDeploymentContext(deployment.context)
        : undefined;

    const githubContext =
        deploymentContext?.contextType === 'github-action'
            ? decorateGithubDeploymentContext(deploymentContext)
            : undefined;

    const workflowStartsWithEmoji = startsWithEmoji(
        githubContext?.data.workflow ?? ''
    );

    if (githubContext) {
        return (
            <div className="card flex flex-wrap items-stretch justify-stretch gap-4">
                <Link
                    to="/site/$siteId/deployment/$deploymentId"
                    params={{
                        deploymentId: deployment?.deployment_id ?? '',
                        siteId: deployment?.site_id ?? '',
                    }}
                    className="block h-fit w-full cursor-pointer md:h-screen md:max-h-32 md:w-fit"
                >
                    <div className="aspect-video h-full min-h-24 rounded-md border bg-secondary drop-shadow-sm md:max-h-48">
                        {previews && previews.length > 0 && (
                            <img
                                alt="Deployment Preview"
                                src={previews[0].preview_path}
                                className="size-full object-cover"
                            />
                        )}
                    </div>
                </Link>
                <div className="flex grow flex-wrap justify-between">
                    <div className="md:w-fit md:grow">
                        <div className="flex w-fit items-center gap-2">
                            <Link
                                to="/site/$siteId/deployment/$deploymentId"
                                params={{
                                    deploymentId:
                                        deployment?.deployment_id ?? '',
                                    siteId: deployment?.site_id ?? '',
                                }}
                                className="flex w-fit items-center gap-2 hover:text-link hover:underline"
                            >
                                {githubContext.data.commit.message}
                            </Link>
                            <WorkflowStatusIndicator
                                status={githubContext.data.workflow_status}
                            />
                        </div>
                        <div className="w-fit">
                            <Link
                                to={githubContext.data.commit.url}
                                className="flex w-fit items-center gap-1 text-muted hover:text-link hover:underline"
                                target="_blank"
                            >
                                <FiGitCommit />
                                {githubContext.data.commit.id.slice(0, 7)}
                            </Link>
                            <Link
                                to={githubContext.workflowUrl}
                                className="flex w-fit items-center gap-1 text-muted hover:text-link hover:underline"
                                target="_blank"
                            >
                                {!workflowStartsWithEmoji && <FiFileText />}
                                {githubContext.data.workflow}
                            </Link>
                            {githubContext.duration &&
                                match(githubContext.duration)
                                    .with({ type: 'completed' }, (duration) => (
                                        <div className="flex items-center gap-1 text-muted">
                                            <FiClock />
                                            {secondsToDuration(
                                                duration.duration
                                            )}
                                        </div>
                                    ))
                                    .with({ type: 'pending' }, (duration) => (
                                        <div className="flex animate-pulse items-center gap-1 text-muted">
                                            <FiClock className="animate-spin" />
                                            <LiveAgo
                                                date={
                                                    new Date(duration.startedAt)
                                                }
                                            />
                                        </div>
                                    ))
                                    .otherwise(() => <></>)}
                        </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                        <Link
                            to={githubContext.workflowUrl}
                            className="w-fit rounded-md bg-secondary px-2 py-0"
                            target="_blank"
                        >
                            {githubContext.data.event} #{' '}
                            {githubContext.data.runNumber}
                        </Link>
                        <Link
                            to={
                                `https://github.com/${githubContext.data.commit.author.username}` as any
                            }
                            className="flex items-center gap-2 hover:text-link hover:underline"
                            target="_blank"
                        >
                            <span>{githubContext.data.commit.author.name}</span>
                            <img
                                src={`https://github.com/${githubContext.data.commit.author.username}.png`}
                                className="size-6 rounded-sm"
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
            </div>
        );
    }

    return (
        <div className="card flex flex-wrap items-stretch justify-stretch gap-4">
            <Link
                to="/site/$siteId/deployment/$deploymentId"
                params={{
                    deploymentId: deployment?.deployment_id ?? '',
                    siteId: deployment?.site_id ?? '',
                }}
                className="block h-fit w-full cursor-pointer md:h-screen md:max-h-32 md:w-fit"
            >
                <div className="aspect-video h-full min-h-24 overflow-hidden rounded-md border bg-secondary drop-shadow-sm md:max-h-48">
                    {previews && previews.length > 0 && (
                        <img
                            alt="Deployment Preview"
                            src={previews[0].preview_path}
                            className="size-full object-cover"
                        />
                    )}
                </div>
            </Link>
            <div className="w-full py-2 md:w-fit md:grow">
                <div className="flex w-fit items-center gap-2">
                    {previews && previews.length > 0 && (
                        <div className="flex size-6 items-center justify-center overflow-hidden">
                            <img
                                alt="Deployment Preview"
                                src={previews[0].favicon_path}
                                className="object-fit size-full"
                            />
                        </div>
                    )}

                    <div>{deployment_id}</div>
                    {/* <Link
                        to="/site/$siteId/deployment/$deploymentId"
                        params={{
                            deploymentId: deployment?.deployment_id ?? '',
                            siteId: deployment?.site_id ?? '',
                        }}
                        className="hover:text-link flex w-fit items-center gap-2 hover:underline"
                    >
                        {githubContext.data.commit.message}
                    </Link> */}
                    {/* <WorkflowStatusIndicator
                        status={githubContext.data.workflow_status}
                    /> */}
                </div>
                <div className="w-fit">
                    {/* <Link
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
                            {!workflowStartsWithEmoji && <FiFileText />}
                            {githubContext.data.workflow}
                        </Link> */}
                    {/* {githubContext.duration &&
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
                                .otherwise(() => <></>)} */}
                </div>
            </div>
            <div className="flex flex-col items-end justify-center gap-2 ">
                {/* <Link
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
                    </Link> */}
                {deployment?.created_at && (
                    <div className="text-muted">
                        <TimeAgo
                            date={new Date(deployment.created_at)}
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
};
