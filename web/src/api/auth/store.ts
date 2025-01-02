import { createStore } from '@xstate/store';
import { useSelector } from '@xstate/store/react';

const loadInitial = () => {
    const auth = localStorage.getItem('@edgeserver/auth');

    return auth ? JSON.parse(auth) : { token: '' };
};

export const authStore = createStore({
    context: loadInitial(),
    on: {
        clearAuthToken: (context) => ({
            token: '',
        }),
        setAuthToken: (context, event: { token: string }) => ({
            token: event.token,
        }),
    },
});

authStore.subscribe((snapshot) => {
    localStorage.setItem('@edgeserver/auth', JSON.stringify(snapshot.context));
});

export const useAuth = () => useSelector(authStore, (state) => state.context);
