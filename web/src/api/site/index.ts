import { queryOptions, useMutation, useQuery } from '@tanstack/react-query';

import { queryClient } from '@/util/query';

import { apiRequest } from '../core';
import { components } from '../schema.gen';

export type Site = components['schemas']['Site'];

export const getSites = () =>
    queryOptions({
        queryKey: ['auth', 'sites'],
        queryFn: async () => {
            const response = await apiRequest('/site', 'get', {});

            return response.data;
        },
    });

export const useSites = () => {
    return useQuery(getSites());
};

export const getTeamSites = (teamId: string) =>
    queryOptions({
        queryKey: ['auth', 'team', '{teamId}', teamId, 'sites'],
        queryFn: async () => {
            const response = await apiRequest('/team/{team_id}/sites', 'get', {
                path: { team_id: teamId },
            });

            return response.data;
        },
        enabled: !!teamId,
    });

export const useTeamSites = (teamId: string) => {
    return useQuery(getTeamSites(teamId));
};

export const getSite = (siteId?: string) =>
    queryOptions({
        queryKey: ['auth', 'site', '{siteId}', siteId],
        queryFn: async () => {
            if (!siteId) throw new Error('No siteId');

            const response = await apiRequest('/site/{site_id}', 'get', {
                path: { site_id: siteId },
            });

            return response.data;
        },
        enabled: !!siteId,
    });

export const useSite = (siteId?: string) => {
    return useQuery(getSite(siteId));
};

export const getSiteDeployments = (siteId?: string) =>
    queryOptions({
        queryKey: ['auth', 'site', '{siteId}', siteId, 'deployments'],
        queryFn: async () => {
            if (!siteId) return;

            const response = await apiRequest(
                '/site/{site_id}/deployments',
                'get',
                {
                    path: { site_id: siteId },
                }
            );

            return response.data;
        },
        enabled: !!siteId,
    });

export const useSiteDeployments = (siteId?: string) => {
    return useQuery(getSiteDeployments(siteId));
};

export const useSiteCreate = () =>
    useMutation({
        mutationFn: async (site: { name: string; team_id: string }) => {
            const response = await apiRequest('/site', 'post', {
                data: site,
                contentType: 'application/json; charset=utf-8',
            });

            queryClient.invalidateQueries({ queryKey: ['auth', 'sites'] });
            queryClient.invalidateQueries({
                queryKey: ['auth', 'team', '{teamId}', site.team_id, 'sites'],
            });

            return response.data;
        },
    });
