import { Button } from '@components/Button';
import { DisconnectButton } from '@components/DisconnectButton';
import { capitalizeFirstLetter } from '@utils/capitalize';
import { environment } from '@utils/enviroment';
import { formatAddress } from '@utils/formatAddress';
import { gradientAvatar } from '@utils/gradientAvatar';
import { useENS } from '@utils/queries/useENS';
import { FC } from 'react';
import { SiweMessage } from 'siwe';
import { useAccount, useConnect, useSignMessage } from 'wagmi';

import gear from '../../../assets/gear.svg';

export const Setup: FC = () => {
    const { data: Wallet, isSuccess } = useAccount();

    const { Avatar, Name } = useENS();

    const { activeConnector } = useConnect();

    if (!Wallet || !isSuccess || !Wallet.address) return <>Error Auth Data</>;

    const payload = {
        domain: window.location.host,
        address: Wallet.address,
        statement: 'Setup EdgeServer',
        chainId: 137,
        uri: window.location.origin,
        version: '1',
    };

    const message = new SiweMessage(payload);

    const {
        signMessage,
        isLoading: signIsLoading,
        reset: resetSignage,
    } = useSignMessage({
        message: message.prepareMessage(),
        onSuccess: async (data, _variables) => {
            // console.log('Successfully added,', data, JSON.stringify(message));
            const returnData = await fetch(
                environment.API_URL + '/api/admin/setup',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ message, signature: data }),
                }
            );

            // TODO: find a better way to update UI after setup
            window.location.reload();
        },
    });

    return (
        <div className="p-8 card logincard w-full max-w-xl flex flex-col gap-6">
            <div className="flex items-center gap-4">
                <img src={gear} className="w-16 h-16" alt="setup icon" />
                <h2 className="text-2xl font-bold">Setup EdgeServer</h2>
            </div>
            <div>
                Welcome to EdgeServer! To get started we must first setup your
                EdgeServer instance with an admin account.
            </div>
            <div>The following account will be used as the admin account.</div>
            <div className="flex items-center gap-4 flex-wrap">
                <div className="w-16 h-16 flex-shrink-0 rounded-full bg-neutral-700">
                    {Avatar ? (
                        <img
                            src={Avatar}
                            className="w-16 h-16 rounded-full"
                            alt="ENSavatar"
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
            </div>
            <div className="flex flex-col gap-2">
                {signIsLoading ? (
                    <div className="hvr-hover">
                        <div className="hvr-regular">
                            <Button
                                className="w-full py-5 justify-center text-base"
                                onClick={() => resetSignage()}
                                label="Pending..."
                                variant="disabled"
                                pending
                            />
                        </div>
                        <div className="hvr-alt">
                            <Button
                                className="w-full py-5 justify-center text-base"
                                onClick={() => resetSignage()}
                                label="Click to cancel"
                                variant="delete"
                            />
                        </div>
                    </div>
                ) : (
                    <Button
                        className="w-full py-5 justify-center text-base"
                        label="Configure EdgeServer"
                        onClick={() => signMessage()}
                    />
                )}
                <DisconnectButton label="Change account" full />
            </div>
        </div>
    );
};
