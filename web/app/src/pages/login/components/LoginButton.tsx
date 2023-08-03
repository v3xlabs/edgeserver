/* eslint-disable jsx-a11y/alt-text */
import { useAuth } from 'src/hooks/useAuth';

export const LoginButton = () => {
    const { user } = useAuth();

    return (
        <button
            className="group flex items-center justify-center rounded-lg bg-gray-100 p-2 font-bold transition hover:brightness-95"
            onClick={() => {
                console.log('login');
            }}
        >
            Connect App
        </button>
    );
};
