import { redirect } from '@tanstack/react-router';

import { authStore } from './store';

export const preflightAuth = async () => {
    const { token } = authStore.getSnapshot().context;

    if (!token)
        throw redirect({
            to: '/login',
            search: { redirect: window.location.pathname },
        });
};
