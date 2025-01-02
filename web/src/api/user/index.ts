import { queryOptions, useQuery } from '@tanstack/react-query';

import { apiRequest } from '../core';
import { components } from '../schema.gen';

export type User = components['schemas']['User'];

export const getMe = () =>
    queryOptions({
        queryKey: ['user', 'me'],
        queryFn: async () => {
            const response = await apiRequest('/user', 'get', {});

            return response.data;
        },
    });

export const useMe = () => useQuery(getMe());

export const getUser = (user_id?: string) =>
    queryOptions({
        queryKey: ['user', user_id],
        queryFn: async () => {
            if (!user_id) return;

            const response = await apiRequest('/user/{user_id}', 'get', {
                path: { user_id },
            });

            return response.data;
        },
    });

export const useUser = (user_id?: string) => useQuery(getUser(user_id));
