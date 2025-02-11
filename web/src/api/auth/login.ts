import { useMutation } from '@tanstack/react-query';

import { apiRequest } from '../core';
import { authStore } from './store';

export const useLogin = () => {
    return useMutation({
        mutationFn: async (data: { username: string; password: string }) => {
            const response = await apiRequest('/auth/login', 'post', {
                contentType: 'application/json; charset=utf-8',
                data,
            });

            const { token } = response.data;

            console.log('setting auth token', token);
            authStore.send({ type: 'setAuthToken', token });

            return response.data;
        },
    });
};
