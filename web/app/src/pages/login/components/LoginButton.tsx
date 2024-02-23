/* eslint-disable jsx-a11y/alt-text */
import { useAuth } from 'src/hooks/useAuth';

export const LoginButton = () => {
    const { user, signIn } = useAuth();

    return (
        // <ConnectKitButton.Custom>
        //     {({
        //         isConnected,
        //         isConnecting,
        //         show,
        //         hide,
        //         address,
        //         ensName,
        //         chain,
        //     }) => {
        //         return (
                    <button
                        className="group flex items-center justify-center rounded-lg bg-gray-100 p-2 font-bold transition hover:brightness-95"
                        onClick={signIn}
                    >
                        Connect App
                    </button>
        //         );
        //     }}
        // </ConnectKitButton.Custom>
    );
};
