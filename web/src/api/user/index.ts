import { queryOptions, useQuery } from '@tanstack/react-query';

import { authStore, useAuth } from '../auth';
import { apiRequest } from '../core';
import { components } from '../schema.gen';

export type User = components['schemas']['User'];

export const getMe = (token_input?: string) =>
    queryOptions({
        queryKey: ['auth', 'user', 'me'],
        queryFn: async () => {
            const { token } = authStore.getSnapshot().context;

            if (!token) throw new Error('No token');

            const response = await apiRequest('/user', 'get', {});

            return response.data;
        },
        // enabled: !!token_input,
        // initialData: undefined,
        // retry: 0,
        // placeholderData: undefined,
    });

export const useMe = () => {
    const { token } = useAuth();

    return useQuery(getMe(token));
};

export const getUser = (user_id?: string) =>
    queryOptions({
        queryKey: ['auth', 'user', '{user_id}', user_id],
        queryFn: async () => {
            if (!user_id) throw new Error('No user_id');

            const { token } = authStore.getSnapshot().context;

            if (!token) throw new Error('No token');

            const response = await apiRequest('/user/{user_id}', 'get', {
                path: { user_id },
            });

            return response.data;
        },
        enabled: !!user_id,
        initialData: undefined,
    });

export const useUser = (user_id?: string) => useQuery(getUser(user_id));

export const getUsers = (
    filter?: (user: Omit<User, 'created_at'>) => boolean
) =>
    queryOptions({
        queryKey: ['auth', 'userlist'],
        queryFn: async () => {
            const response = await apiRequest('/user/all', 'get', {});

            const users = response.data;

            return filter ? users.filter(filter) : users;
        },
        enabled: true,
        initialData: undefined,
    });

export const useUsers = (
    filter?: (user: Omit<User, 'created_at'>) => boolean
) => useQuery(getUsers(filter));
