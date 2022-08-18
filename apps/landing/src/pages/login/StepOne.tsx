import { ConnectButton } from '@rainbow-me/rainbowkit';
import { FC } from 'react';

export const LoginStepOne: FC = () => {
    // https://www.rainbowkit.com/docs/custom-connect-button
    return (
        <div className="p-8 card w-full max-w-lg m-4">
            <ConnectButton.Custom>
                {({ chain, openConnectModal }) => {
                    return (
                        <button
                            onClick={openConnectModal}
                            className="bluebutton w-full px-16 py-5 rounded-lg font-bold text-md justify-center items-center flex gap-4"
                        >
                            <img
                                className="w-5 block"
                                src="https://cdn.helgesson.dev/assets/lvkdotsh/eth-icon.svg"
                                alt="Ethereum logo"
                            />
                            <div>Sign-In with Ethereum</div>
                        </button>
                    );
                }}
            </ConnectButton.Custom>
        </div>
    );
};
