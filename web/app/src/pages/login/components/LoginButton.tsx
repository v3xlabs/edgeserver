/* eslint-disable jsx-a11y/alt-text */
import { ConnectKitButton } from 'connectkit';
import { formatAddress } from 'ens-tools';
import { FiCreditCard } from 'react-icons/fi';
import { useAuth } from 'src/hooks/useAuth';
import { useEnsAvatar, useEnsName } from 'wagmi';

export const LoginButton = () => {
    const { user } = useAuth();

    const { data: ensName } = useEnsName({ address: user as any });
    const { data: ensImage } = useEnsAvatar({ address: ensName as any });
    const formattedaddress = user ? formatAddress(user) : 'Not Connected';

    return (
        <ConnectKitButton.Custom>
            {({
                isConnected,
                isConnecting,
                show,
                hide,
                address,
                ensName,
                chain,
            }) => {
                return (
                    <button
                        className="group flex items-center justify-center"
                        onClick={show}
                    >
                        <div className="flex h-12 rounded-lg border-[1px] border-purple-500">
                            <div className="flex items-center gap-x-2 rounded-l-md bg-purple-500 px-4 text-lg font-bold text-white group-hover:bg-purple-700">
                                Sign in with Ethereum
                                <FiCreditCard className="h-6 w-6 text-white" />
                            </div>
                            <div className="flex w-52 items-center justify-center gap-x-2 rounded-r-lg text-lg font-bold text-purple-500">
                                {user
                                    ? `${ensName || formattedaddress}`
                                    : 'Not Conected'}
                                {user && (
                                    <img
                                        src={ensImage || ''}
                                        className="h- w-10 justify-center rounded-full"
                                    />
                                )}
                            </div>
                        </div>
                    </button>
                );
            }}
        </ConnectKitButton.Custom>
    );
};
