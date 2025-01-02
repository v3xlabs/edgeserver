import { useMutation } from '@tanstack/react-query';

import { queryClient } from '@/util/query';

import { apiRequest } from '../core';

export const useBootstrap = () => {
    return useMutation({
        mutationFn: async (data: { username: string; password: string }) => {
            const response = await apiRequest('/auth/bootstrap', 'post', {
                contentType: 'application/json; charset=utf-8',
                data,
            });

            queryClient.invalidateQueries({ queryKey: ['can-bootstrap'] });

            return response.data;
        },
    });
};
