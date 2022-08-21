import { ConnectButton } from '@rainbow-me/rainbowkit';
import { FC } from 'react';

import logo from '../../../assets/logo.svg';

export const LoginStepOne: FC = () => {
    // https://www.rainbowkit.com/docs/custom-connect-button
    return (
        <div className="p-8 card logincard w-full max-w-lg m-4 flex flex-col items-center gap-4">
            <div className="flex items-center gap-4">
                <img src={logo} alt="" className="w-24" />
                <h1 className="text-2xl">EDGESERVER.io</h1>
            </div>
            <div className="w-full h-64 bg-neutral-200 dark:bg-neutral-700 rounded-lg p-6">
                Hi there this box is placeholder
            </div>
            <ConnectButton.Custom>
                {/* { chain } */}
                {({ openConnectModal }) => {
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
            <div>
                <a href="https://github.com/lvkdotsh">LVKDOTSH</a> /{' '}
                <a href="https://github.com/lvkdotsh/edgeserver-app">Github</a>
            </div>
        </div>
    );
};
