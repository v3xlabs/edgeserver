import { queryOptions, useMutation, useQuery } from '@tanstack/react-query';

import { apiRequest } from '../core';
import { components } from '../schema.gen';
import { queryClient } from '@/util/query';

export type Team = components['schemas']['Team'];

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

export const getTeam = (teamId?: string) =>
    queryOptions({
        queryKey: ['team', '{teamId}', teamId],
        queryFn: async () => {
            if (!teamId) {
                return;
            }

            const response = await apiRequest('/team/{team_id}', 'get', {
                path: { team_id: teamId },
            });

            return response.data;
        },
    });

export const useTeam = (teamId?: string) => {
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
        enabled: !!teamId,
    });

export const useTeamInvites = (teamId: string) => {
    return useQuery(getTeamInvites(teamId));
};

export const getTeamMembers = (teamId: string) =>
    queryOptions({
        queryKey: ['team', '{teamId}', teamId, 'members'],
        queryFn: async () => {
            const response = await apiRequest(
                '/team/{team_id}/members',
                'get',
                {
                    path: { team_id: teamId },
                }
            );

            return response.data;
        },
        enabled: !!teamId,
    });

export const useTeamMembers = (teamId: string) => {
    return useQuery(getTeamMembers(teamId));
};

export const useTeamCreate = () =>
    useMutation({
        mutationFn: async (team: { name: string }) => {
            const response = await apiRequest('/team', 'post', {
                data: team,
                contentType: 'application/json; charset=utf-8',
            });

            queryClient.invalidateQueries({ queryKey: ['teams'] });

            return response.data;
        },
    });
