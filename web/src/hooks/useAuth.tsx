import create from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthState = create(
    persist<{
        auth_token: string;
        setAuthToken: (_st: string) => void;
    }>(
        (set) => ({
            auth_token: '',
            setAuthToken: (st: string) => {
                return { auth_token: st };
            },
        }),
        {
            name: 'auth_token',
        }
    )
);

export enum AuthState {
    LoggedOut, // User never signed in or explicitly signed out
    Loading, // User has auth key and we are verifying
    LoggedIn, // User is successfully logged in
    Invalid, // Invalid
}

export type useAuthResult = {
    state: AuthState;
    user?: string;
    signIn?: () => Promise<boolean>;
    signOut?: () => Promise<boolean>;
};

export const useAuth = (): useAuthResult => {
    const { auth_token, setAuthToken } = useAuthState();

    return {
        state: AuthState.LoggedOut,
    };
};
