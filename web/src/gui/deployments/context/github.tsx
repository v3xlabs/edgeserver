import { Link } from '@tanstack/react-router';
import { FC } from 'react';
import { FiGithub } from 'react-icons/fi';

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

export const decorateGithubDeploymentContext = (
    context: GithubDeploymentContextType
) => {
    // strip `/commit/*` from the url
    const repoUrl = context.data.commit.url.replace(/\/commit\/.*/, '');
    const workflowUrl = `${repoUrl}/actions/runs/${context.data.runId}`;

    let duration;

    if (context.data.pre_time && context.data.post_time) {
        const preTime = new Date(context.data.pre_time);
        const postTime = new Date(context.data.post_time);

        duration = Math.floor((postTime.getTime() - preTime.getTime()) / 1000);
    }

    return { ...context, workflowUrl, repoUrl, duration };
};

export const GithubDeploymentContext: FC<{
    context: GithubDeploymentContextType;
}> = ({ context }) => {
    const decoratedContext = decorateGithubDeploymentContext(context);

    return (
        <div className="card no-padding flex justify-between gap-2 p-5">
            <div className="h-full grow space-y-1">
                <Link
                    to={decoratedContext.workflowUrl}
                    className="hover:text-link flex items-center gap-2 hover:underline"
                    target="_blank"
                >
                    <FiGithub className="text-xl" />
                    <div className="font-bold">
                        {context.data.commit.message}
                    </div>
                </Link>
                <div className="space-y-2 pl-8">
                    <Link
                        to={context.data.commit.url}
                        className="hover:text-link hover:underline"
                        target="_blank"
                    >
                        {context.data.sha}
                    </Link>
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
            </div>
            <div className="flex flex-col items-end justify-center">
                <div>{context.data.commit.timestamp}</div>
                <div className="bg-secondary w-fit rounded-md border px-2 py-0">
                    {context.data.event}
                </div>
            </div>
        </div>
    );
};
