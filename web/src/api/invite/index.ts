import { queryOptions, useMutation, useQuery } from '@tanstack/react-query';

import { apiRequest } from '../core';
import { components } from '../schema.gen';
import { queryClient } from '@/util/query';

export type Invite = components['schemas']['UserTeamInvite'];

export const getInvite = (invite_id: string) =>
    queryOptions({
        queryKey: ['invite', invite_id],
        queryFn: async () => {
            const response = await apiRequest('/invite/{invite_id}', 'get', {
                path: { invite_id },
            });

            return response.data;
        },
    });

export const useInvite = (invite_id: string) => {
    return useQuery(getInvite(invite_id));
};

export const useAcceptInvite = (invite_id: string, team_id?: string) => {
    return useMutation({
        mutationFn: async () => {
            const response = await apiRequest(
                '/invite/{invite_id}/accept',
                'post',
                {
                    path: { invite_id },
                }
            );

            if (team_id) {
                queryClient.invalidateQueries({
                    queryKey: ['team', '{teamId}', team_id, 'invites'],
                });
            }

            return response.data;
        },
    });
};
