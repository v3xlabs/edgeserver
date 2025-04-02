import { queryOptions, useMutation, useQuery } from '@tanstack/react-query';

import { parseDeploymentContext } from '@/gui/deployments/context/context';
import { decorateGithubDeploymentContext } from '@/gui/deployments/context/github';

import { apiRequest } from '../core';
import { components } from '../schema.gen';
import { useSiteDeployments } from '../site';

export type Deployment = components['schemas']['Deployment'];

export const getDeployment = (siteId: string, deploymentId: string) =>
    queryOptions({
        queryKey: ['auth', 'deployment', '{deployment_id}', deploymentId],
        queryFn: async () => {
            const response = await apiRequest(
                '/site/{site_id}/deployment/{deployment_id}',
                'get',
                {
                    path: {
                        site_id: siteId,
                        deployment_id: deploymentId,
                    },
                }
            );

            return response.data;
        },
        refetchInterval(query) {
            // parse context if it exists
            // if github context workflow_status is pre or push, return 1000
            // ensure that created_at is within the last 30 minutes
            // if not, return undefined

            const site = query.state.data?.site_id;
            const deployment = query.state.data;

            if (!deployment || !site) return;

            const deploymentContext = deployment.context
                ? parseDeploymentContext(deployment.context)
                : undefined;

            const githubContext =
                deploymentContext?.contextType === 'github-action'
                    ? decorateGithubDeploymentContext(deploymentContext)
                    : undefined;

            if (githubContext) {
                const workflowStatus = githubContext.data.workflow_status;
                const createdAt = new Date(deployment.created_at);
                const now = new Date();
                const diff = now.getTime() - createdAt.getTime();
                const diffInMinutes = diff / 60_000;

                if (diffInMinutes > 30) {
                    return;
                }

                if (workflowStatus === 'pre' || workflowStatus === 'push') {
                    return 1000;
                }
            }
        },
    });

export const useDeployment = (siteId: string, deploymentId: string) =>
    useQuery(getDeployment(siteId, deploymentId));

export const getDeploymentFiles = (siteId: string, deploymentId: string) =>
    queryOptions({
        queryKey: [
            'auth',
            'deployment',
            '{deployment_id}',
            deploymentId,
            'files',
        ],
        queryFn: async () => {
            const response = await apiRequest(
                '/site/{site_id}/deployment/{deployment_id}/files',
                'get',
                {
                    path: {
                        site_id: siteId,
                        deployment_id: deploymentId,
                    },
                }
            );

            return response.data;
        },
    });

export const useDeploymentFiles = (siteId: string, deploymentId: string) =>
    useQuery(getDeploymentFiles(siteId, deploymentId));

export const getDeploymentPreviews = (
    siteId: string,
    deploymentId: string | undefined
) =>
    queryOptions({
        // @ts-ignore
        queryKey: deploymentId
            ? ([
                  'auth',
                  'deployment',
                  '{deployment_id}',
                  deploymentId,
                  'previews',
              ] as unknown)
            : (undefined as unknown),
        queryFn: async () => {
            if (!deploymentId) return;

            const response = await apiRequest(
                '/site/{site_id}/deployment/{deployment_id}/preview',
                'get',
                {
                    path: {
                        site_id: siteId,
                        deployment_id: deploymentId,
                    },
                }
            );

            return response.data;
        },
        enabled: Boolean(deploymentId),
    });

export const useDeploymentPreviews = (
    siteId: string,
    deploymentId: string | undefined
) => useQuery(getDeploymentPreviews(siteId, deploymentId));

export const useDeploymentPreviewRefetch = (
    siteId: string,
    deploymentId: string
) =>
    useMutation({
        mutationFn: async () => {
            const response = await apiRequest(
                '/site/{site_id}/deployment/{deployment_id}/preview',
                'post',
                {
                    path: {
                        site_id: siteId,
                        deployment_id: deploymentId,
                    },
                }
            );

            return response.data;
        },
    });

// Gets the last main deployment
export const useLastDeployment = (siteId: string) => {
    const { data: deployments } = useSiteDeployments(siteId);

    const deployment = deployments?.at(0);

    return { data: deployment };
};

export const useLastPreviewDeployment = (siteId: string | undefined) => {
    if (!siteId) return { data: undefined };

    const { data: deployments } = useSiteDeployments(siteId);
    const { data: preview_one } = useDeploymentPreviews(
        siteId,
        deployments?.at(0)?.deployment_id
    );
    const { data: preview_two } = useDeploymentPreviews(
        siteId,
        deployments?.at(1)?.deployment_id
    );

    console.log({ preview_one, preview_two });

    return {
        data:
            preview_one && preview_one?.length > 0 ? preview_one : preview_two,
    };
};
