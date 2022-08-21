import { Login } from '@pages/login/Login';
import { useAuth, useJWT } from '@utils/useAuth';
import { FC, useEffect } from 'react';

export const LoginFacade: FC<{ children: JSX.Element }> = ({ children }) => {
    const { state, address } = useAuth();
    const { token, resetToken } = useJWT((state) => state);

    useEffect(() => {
        if (!address && token) {
            resetToken();
        }
    }, [address, token]);

    // User has token and is waiting for address to confirm
    if (state === 'loading-alt') return <>resuming session...</>;

    // User does not have token&address pair (step1 & step2)
    if (state !== 'authenticated') return <Login />;

    return <>{children}</>;
};
