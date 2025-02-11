import { queryOptions, useMutation, useQuery } from '@tanstack/react-query';

import { queryClient } from '@/util/query';

import { useLogin } from '../auth';
import { apiRequest } from '../core';
import { components } from '../schema.gen';

export type Invite = components['schemas']['UserTeamInvite'];

export const getInvite = (invite_id: string) =>
    queryOptions({
        queryKey: ['invite', '{invite_id}', invite_id],
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
                    queryKey: ['auth', 'team', '{teamId}', team_id, 'invites'],
                });
            }

            return response.data;
        },
    });
};

export const useCreateAccountViaInvite = ({
    invite_id,
}: {
    invite_id: string;
}) => {
    const { mutate: login } = useLogin();

    return useMutation({
        mutationFn: async (data: { username: string; password: string }) => {
            const response = await apiRequest(
                '/invite/{invite_id}/accept/new',
                'post',
                {
                    path: { invite_id },
                    contentType: 'application/json; charset=utf-8',
                    data,
                }
            );

            login(data);

            return response.data;
        },
    });
};
