import { DisconnectButton } from '@components/DisconnectButton';
import { capitalizeFirstLetter } from '@utils/capitalize';
import { environment } from '@utils/enviroment';
import { formatAddress } from '@utils/formatAddress';
import { gradientAvatar } from '@utils/gradientAvatar';
import { useENS } from '@utils/queries/useENS';
import { useJWT } from '@utils/useAuth';
import { FC } from 'react';
import { SiweMessage } from 'siwe';
import { useAccount, useConnect, useSignMessage } from 'wagmi';

export const LoginStepTwo: FC = () => {
    const { data: Wallet, isSuccess } = useAccount();
    const setToken = useJWT((state) => state.setToken);

    const { Name, Avatar } = useENS();

    const { activeConnector } = useConnect();

    // Used twice
    if (!Wallet || !isSuccess || !Wallet.address) return <>Error Auth Data</>;

    const payload = {
        domain: window.location.host,
        address: Wallet.address,
        statement: 'Sign in with Ethereum to the app.',
        chainId: 137,
        uri: window.location.origin,
        version: '1',
    };

    const message = new SiweMessage(payload);

    const apiUrl = environment.API_URL;

    const {
        signMessage,
        isLoading: signIsLoading,
        reset: resetSignage,
    } = useSignMessage({
        message: message.prepareMessage(),
        onSuccess: async (data, _variables) => {
            // console.log('Successfully added,', data, JSON.stringify(message));
            const loginData = await fetch(apiUrl + '/api/login/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message, signature: data }),
            });

            const { token } = await loginData.json();

            if (!token) {
                console.log('No token found');

                return;
            }

            setToken(token);
        },
    });

    if (!Wallet || !isSuccess) return <>Error Auth Data</>;

    return (
        <div className="p-8 card logincard w-full max-w-xl flex flex-col gap-4">
            <h2 className="text-lg mb-4">Step two</h2>
            <div className="flex items-center gap-4 flex-wrap">
                <div className="w-16 h-16 flex-shrink-0 rounded-full bg-neutral-700">
                    {Avatar ? (
                        <img
                            src={Avatar}
                            alt="Avatar"
                            className="w-16 h-16 rounded-full"
                        />
                    ) : (
                        <div
                            className="w-16 h-16 rounded-full overflow-hidden"
                            dangerouslySetInnerHTML={{
                                __html: gradientAvatar(Wallet.address),
                            }}
                        />
                    )}
                </div>
                <div className="flex-1">
                    <div className="font-bold">
                        {Name || formatAddress(Wallet.address)}
                    </div>
                    <div className="opacity-50">
                        Logged in with{' '}
                        <b>
                            {capitalizeFirstLetter(
                                activeConnector?.id || 'unknown'
                            )}
                        </b>
                    </div>
                </div>
                <div>
                    <DisconnectButton />
                </div>
            </div>
            <div>
                {signIsLoading ? (
                    <button
                        className="w-full bg-neutral-500 text-white px-16 py-5 rounded-lg font-bold text-md justify-center items-center flex gap-4 hvr-hover hover:bg-red-600"
                        onClick={() => resetSignage()}
                    >
                        <span className="hvr-regular">Loading...</span>
                        <span className="hvr-alt">(Click to Cancel)</span>
                    </button>
                ) : (
                    <button
                        className="w-full bluebutton px-16 py-5 rounded-lg font-bold text-md justify-center items-center flex gap-4"
                        onClick={() => signMessage()}
                    >
                        Authorize Device
                    </button>
                )}
            </div>
        </div>
    );
};
