import { useJWT } from '@utils/useAuth';
import { FC } from 'react';
import { useDisconnect } from 'wagmi';

export const DisconnectButton: FC<{ label?: string; full?: boolean }> = ({
    label,
    full,
}) => {
    const { disconnect: disconnectWallet } = useDisconnect();
    const resetToken = useJWT((state) => state.resetToken);

    return (
        <button
            className={
                'w-full px-10 py-5 rounded-lg bg-accent-blue-alt text-accent-blue-normal font-bold text-md flex gap-4 justify-center items-center' +
                (full ? '' : ' max-w-xs')
            }
            onClick={() => {
                disconnectWallet();
                resetToken();
            }}
        >
            {label || 'Disconnect'}
        </button>
    );
};
