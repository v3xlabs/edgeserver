// import { authStore, useAuth } from './auth/store';
import { createFetch } from 'openapi-hooks';
export { ApiError } from 'openapi-hooks';

import { authStore } from './auth/store';
import { paths } from './schema.gen';

export const BASE_URL =
    import.meta.env.VITE_API_URL || `${window.location.origin}/api/`;

const last_token = {
    token: authStore.getSnapshot().context.token,
};

const headers = new Proxy(
    { Authorization: `Bearer ${last_token.token}` },
    {
        get(target, property) {
            if (property === 'Authorization') {
                const { token } = authStore.getSnapshot().context;

                console.log('headers2', token);

                return `Bearer ${token}`;
            }
        },
    }
);

export const apiRequest = createFetch<paths>({
    baseUrl: BASE_URL,
    headers,
    onError: (error) => {
        /// TODO:
    },
});

authStore.subscribe((snapshot) => {
    console.log('authStore.subscribe', snapshot);

    updateAuthToken(snapshot.context.token);
});

export const updateAuthToken = (token: string) => {
    last_token.token = token;
};
