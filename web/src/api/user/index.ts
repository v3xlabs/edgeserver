import { queryOptions, useQuery } from '@tanstack/react-query';

import { apiRequest } from '../core';

export const getMe = () =>
    queryOptions({
        queryKey: ['user', 'me'],
        queryFn: async () => {
            const response = await apiRequest('/user', 'get', {});

            return response.data;
        },
    });

export const useMe = () => useQuery(getMe());
