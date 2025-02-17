import { Link } from '@tanstack/react-router';
import { FC } from 'react';
import { FiClock, FiFileText, FiGitCommit } from 'react-icons/fi';
import TimeAgo from 'react-timeago-i18n';
import { match } from 'ts-pattern';

import { startsWithEmoji } from '@/util/emoji';
import { LiveAgo, secondsToDuration } from '@/util/time';

import { WorkflowStatusIndicator } from '../WorkflowStatusIndicator';

export type GithubDeploymentContextType = {
    contextType: 'github-action';
    data: {
        event: string; // 'push';
        sha: string; // 'f49a26f53118281e734941ef7e8cb374212d6436';
        workflow: string; // '.github/workflows/build.yaml';
        runNumber: number; // 28;
        runId: number; // 13_300_406_888;
        server_url: string; // 'https://github.com';
        ref: string; // 'refs/heads/master';
        actor: string; // 'lucemans';
        sender: string; // 'lucemans';
        commit: {
            author: {
                email: string; // 'luc@lucemans.nl';
                name: string; // 'Luc';
                username: string; // 'lucemans';
            };
            committer: {
                email: string; // 'luc@lucemans.nl';
                name: string; // 'Luc';
                username: string; // 'lucemans';
            };
            distinct: boolean; // true;
            id: string; // 'f49a26f53118281e734941ef7e8cb374212d6436';
            message: string; // 'Update build';
            timestamp: string; // '2025-02-13T05:26:04+01:00';
            tree_id: string; // 'fea2c25f496451c42e5dc74130b033cc239e2e70';
            url: string; // 'https://github.com/v3xlabs/env-md/commit/f49a26f53118281e734941ef7e8cb374212d6436';
        };
        // ISO string
        pre_time: string;
        push_time: string;
        post_time: string;
        workflow_status: string;
    };
};

export type GithubRunDuration =
    | {
          duration: number;
          type: 'completed';
      }
    | {
          type: 'pending';
          startedAt: string;
      };

export const decorateGithubDeploymentContext = (
    context: GithubDeploymentContextType
) => {
    // strip `/commit/*` from the url
    const repoUrl = context.data.commit.url.replace(/\/commit\/.*/, '');
    const workflowUrl = `${repoUrl}/actions/runs/${context.data.runId}`;

    let duration: GithubRunDuration | undefined;

    if (context.data.pre_time && context.data.post_time) {
        const preTime = new Date(context.data.pre_time);
        const postTime = new Date(context.data.post_time);

        duration = {
            duration: Math.floor(
                (postTime.getTime() - preTime.getTime()) / 1000
            ),
            type: 'completed',
        };
    } else if (
        context.data.pre_time &&
        ['pre', 'push'].includes(context.data.workflow_status)
    ) {
        const preTime = new Date(context.data.pre_time);

        duration = {
            startedAt: preTime.toISOString(),
            type: 'pending',
        };
    }

    return { ...context, workflowUrl, repoUrl, duration };
};

export const GithubDeploymentContext: FC<{
    context: GithubDeploymentContextType;
}> = ({ context }) => {
    const decoratedContext = decorateGithubDeploymentContext(context);

    const workflowStartsWithEmoji = startsWithEmoji(
        decoratedContext.data.workflow
    );

    return (
        <div className="card no-padding space-y-4 p-5">
            <div className="flex items-start justify-between gap-4">
                <div className="h-full space-y-1">
                    <div className="flex items-center gap-2">
                        <div className="font-bold">
                            {context.data.commit.message}
                        </div>
                        {decoratedContext.workflowUrl && (
                            <Link
                                to={decoratedContext.workflowUrl}
                                className="hover:text-link flex items-center gap-2 hover:underline"
                                target="_blank"
                            >
                                <FiFileText />
                            </Link>
                        )}
                        {decoratedContext.data.commit.url && (
                            <Link
                                to={decoratedContext.data.commit.url}
                                className="hover:text-link flex items-center gap-2 hover:underline"
                                target="_blank"
                            >
                                <FiGitCommit />
                            </Link>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Link
                            to={decoratedContext.repoUrl}
                            className="hover:text-link text-muted flex w-fit items-center gap-1 hover:underline"
                            target="_blank"
                        >
                            <FiGitCommit />
                            {decoratedContext.data.commit.id.slice(0, 7)}
                        </Link>
                    </div>
                </div>
                <div className="flex flex-col items-end justify-center">
                    <div className="bg-secondary w-fit rounded-md border px-2 py-0">
                        {context.data.event}
                    </div>
                    <div>
                        <TimeAgo
                            date={new Date(context.data.commit.timestamp)}
                        />
                    </div>
                </div>
            </div>
            <div className="grid grid-flow-col">
                <div className="space-y-1">
                    <div className="text-muted">Created by</div>
                    <Link
                        to={
                            `https://github.com/${context.data.commit.author.username}` as any
                        }
                        className="hover:text-link flex items-center gap-2 hover:underline"
                        target="_blank"
                    >
                        <img
                            src={`https://github.com/${context.data.commit.author.username}.png`}
                            className="size-6 rounded-md"
                            alt={context.data.commit.author.name}
                        />
                        {context.data.commit.author.name}
                    </Link>
                </div>
                {decoratedContext.data.workflow_status && (
                    <div>
                        <div className="text-muted">Status</div>
                        <WorkflowStatusIndicator
                            status={decoratedContext.data.workflow_status}
                            variant="expanded"
                        />
                    </div>
                )}
                {decoratedContext.duration && (
                    <div>
                        <div className="text-muted">Duration</div>
                        {match(decoratedContext.duration)
                            .with({ type: 'completed' }, (duration) => (
                                <div className="text-default flex items-center gap-1.5">
                                    <FiClock />
                                    {secondsToDuration(duration.duration)}
                                </div>
                            ))
                            .with({ type: 'pending' }, (duration) => (
                                <div className="flex animate-pulse items-center gap-1.5 text-cyan-500 dark:text-cyan-300">
                                    <FiClock className="animate-spin" />
                                    <LiveAgo
                                        date={new Date(duration.startedAt)}
                                    />
                                </div>
                            ))
                            .otherwise(() => (
                                <></>
                            ))}
                    </div>
                )}
                {decoratedContext.data.workflow && (
                    <div>
                        <div className="text-muted">Workflow</div>
                        <Link
                            to={decoratedContext.workflowUrl}
                            className="flex items-center gap-1.5 hover:underline"
                            target="_blank"
                        >
                            {!workflowStartsWithEmoji && <FiFileText />}
                            <span>{decoratedContext.data.workflow}</span>
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};
