import { LoginPage } from '@pages/login';
import { FC } from 'react';
import { AuthState, useAuth } from 'src/hooks/useAuth';

export const LoginFacade: FC<{ children: JSX.Element }> = ({ children }) => {
    const { state } = useAuth();

    if (state != AuthState.LoggedIn) return <LoginPage />;

    return <>{children}</>;
};
