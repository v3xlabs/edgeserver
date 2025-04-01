import { queryOptions, useMutation, useQuery } from '@tanstack/react-query';

import { queryClient } from '@/util/query';

import { apiRequest } from '../core';
import { components } from '../schema.gen';

export type TeamKey = components['schemas']['Key'];
export type NewTeamKey = components['schemas']['NewKey'];

export const getTeamKeys = (teamId: string) =>
    queryOptions({
        queryKey: ['auth', 'team', '{teamId}', teamId, 'keys'],
        queryFn: async () => {
            const response = await apiRequest('/team/{team_id}/keys', 'get', {
                path: {
                    team_id: teamId,
                },
            });

            return response.data;
        },
    });

export const useTeamKeys = (teamId: string) => {
    return useQuery(getTeamKeys(teamId));
};

export const useTeamKeyCreate = () =>
    useMutation({
        mutationFn: async ({
            teamId,
            permissions,
        }: {
            teamId: string;
            permissions: string;
        }) => {
            const response = await apiRequest('/team/{team_id}/keys', 'post', {
                path: { team_id: teamId },
                data: { permissions },
                contentType: 'application/json; charset=utf-8',
            });

            queryClient.invalidateQueries({
                queryKey: ['auth', 'team', '{teamId}', teamId, 'keys'],
            });

            return response.data;
        },
    });

export const useTeamKeyDelete = () =>
    useMutation({
        mutationFn: async ({
            teamId,
            keyId,
        }: {
            teamId: string;
            keyId: string;
        }) => {
            const response = await apiRequest(
                '/team/{team_id}/keys/{key_id}',
                'delete',
                {
                    path: { team_id: teamId, key_id: keyId },
                }
            );

            queryClient.invalidateQueries({
                queryKey: ['auth', 'team', '{teamId}', teamId, 'keys'],
            });

            return response.data;
        },
    });
