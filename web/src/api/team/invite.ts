import { queryOptions, useMutation, useQuery } from '@tanstack/react-query';

import { queryClient } from '@/util/query';

import { apiRequest } from '../core';

export const getTeamInvites = (teamId: string) =>
    queryOptions({
        queryKey: ['auth', 'team', '{teamId}', teamId, 'invites'],
        queryFn: async () => {
            const response = await apiRequest(
                '/team/{team_id}/invites',
                'get',
                {
                    path: { team_id: teamId },
                }
            );

            return response.data;
        },
        enabled: !!teamId,
    });

export const useTeamInvites = (teamId: string) => {
    return useQuery(getTeamInvites(teamId));
};

export const useTeamInviteCreate = ({ teamId }: { teamId: string }) => {
    return useMutation({
        mutationFn: async (data: { userId?: string }) => {
            const response = await apiRequest(
                '/team/{team_id}/invites',
                'post',
                {
                    path: { team_id: teamId },
                    data: { user_id: data.userId },
                    contentType: 'application/json; charset=utf-8',
                }
            );

            queryClient.invalidateQueries({
                queryKey: ['auth', 'team', '{teamId}', teamId, 'invites'],
            });

            return response.data;
        },
    });
};
