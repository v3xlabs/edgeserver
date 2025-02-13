import { queryOptions, useQuery } from '@tanstack/react-query';

import { apiRequest } from '../core';
import { components } from '../schema.gen';

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
