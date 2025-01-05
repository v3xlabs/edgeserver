// import { authStore, useAuth } from './auth/store';
import { createFetch } from 'openapi-hooks';
export { ApiError } from 'openapi-hooks';

import { authStore } from './auth/store';
import { paths } from './schema.gen';

export const BASE_URL =
    import.meta.env.VITE_API_URL || `${window.location.origin}/api/`;

export const apiRequest = createFetch<paths>({
    baseUrl: BASE_URL,
    get headers() {
        return {
            Authorization: `Bearer ${authStore.getSnapshot().context.token}`,
        };
    },
    onError: (error) => {
        /// TODO:
    },
});
