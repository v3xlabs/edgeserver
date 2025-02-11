import { redirect } from '@tanstack/react-router';

import { authStore } from './store';

export const preflightAuth = async (token2?: string) => {
    const { token } = authStore.getSnapshot().context;
    const token3 = token2 || token;

    if (!token3 || token3 === '')
        throw redirect({
            to: '/login',
            search: { redirect: window.location.pathname },
        });
};
