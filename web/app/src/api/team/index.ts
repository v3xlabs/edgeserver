import { queryOptions, useQuery } from '@tanstack/react-query';

import { apiRequest } from '../core';

export const getTeams = () =>
    queryOptions({
        queryKey: ['teams'],
        queryFn: async () => {
            const response = await apiRequest('/team', 'get', {});

            return response.data;
        },
    });

export const useTeams = () => {
    return useQuery(getTeams());
};

export const getTeam = (teamId: string) =>
    queryOptions({
        queryKey: ['team', '{teamId}', teamId],
        queryFn: async () => {
            const response = await apiRequest('/team/{team_id}', 'get', {
                path: { team_id: teamId },
            });

            return response.data;
        },
    });

export const useTeam = (teamId: string) => {
    return useQuery(getTeam(teamId));
};

export const getTeamInvites = (teamId: string) =>
    queryOptions({
        queryKey: ['team', '{teamId}', teamId, 'invites'],
        queryFn: async () => {
            const response = await apiRequest('/team/{team_id}/invite', 'get', {
                path: { team_id: teamId },
            });

            return response.data;
        },
    });

export const useTeamInvites = (teamId: string) => {
    return useQuery(getTeamInvites(teamId));
};
