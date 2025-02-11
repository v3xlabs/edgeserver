import { createStore } from '@xstate/store';
import { useSelector } from '@xstate/store/react';

import { queryClient } from '@/util/query';

const loadInitial = () => {
    const auth = localStorage.getItem('@edgeserver/auth');

    return auth ? (JSON.parse(auth) as { token: string }) : { token: '' };
};

export const authStore = createStore({
    context: loadInitial(),
    on: {
        clearAuthToken: (context) => {
            console.log('clearAuthToken', context);
            // queryClient.invalidateQueries({ queryKey: ['auth'] });
            // queryClient.refetchQueries({ queryKey: ['auth'] });

            return {
                token: '',
            };
        },
        setAuthToken: (context, event: { token: string }) => ({
            token: event.token,
        }),
    },
});

let last_token: string | undefined;

authStore.subscribe((snapshot) => {
    console.log('authStore.subscribe', snapshot);
    localStorage.setItem('@edgeserver/auth', JSON.stringify(snapshot.context));

    if (last_token !== snapshot.context.token) {
        console.log('invalidating queries due to auth token change');

        setTimeout(() => {
            // queryClient.invalidateQueries({ queryKey: ['auth'] });
            // queryClient.refetchQueries({ queryKey: ['auth'] });
            queryClient.resetQueries({ queryKey: ['auth'] });
        }, 10);
    }

    last_token = snapshot.context.token;
});

export const useAuth = () => useSelector(authStore, (state) => state.context);
