import { queryOptions, useQuery } from '@tanstack/react-query';

import { apiRequest } from '../core';
import { components } from '../schema.gen';

export type Site = components['schemas']['Site'];

export const getSites = () =>
    queryOptions({
        queryKey: ['sites'],
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
        queryKey: ['team', '{teamId}', teamId, 'sites'],
        queryFn: async () => {
            const response = await apiRequest('/team/{team_id}/sites', 'get', {
                path: { team_id: teamId },
            });

            return response.data;
        },
    });

export const useTeamSites = (teamId: string) => {
    return useQuery(getTeamSites(teamId));
};

export const getSite = (siteId: string) =>
    queryOptions({
        queryKey: ['site', '{siteId}', siteId],
        queryFn: async () => {
            const response = await apiRequest('/site/{site_id}', 'get', {
                path: { site_id: siteId },
            });

            return response.data;
        },
    });

export const useSite = (siteId: string) => {
    return useQuery(getSite(siteId));
};
