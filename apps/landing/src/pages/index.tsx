import { FC } from 'react';

export const Home: FC = () => {
    return (
        <div>
            <div className="w-full flex justify-center items-center h-96">
                <div className="text-6xl font-bold max-w-2xl text-center">
                    The Fastest{' '}
                    <span className="text-transparent bg-clip-text bg-gradient-to-tr from-purple-400 to-pink-600">
                        Web3
                    </span>{' '}
                    <span className="text-transparent bg-clip-text bg-gradient-to-tr from-blue-400 to-cyan-600">
                        Edge
                    </span>{' '}
                    Server
                </div>
            </div>
            <div className="m-8 flex justify-center text-center">
                Just like netlify and vercel, but open-source, decentralized,
                and modular.
            </div>
            <div className="m-8 flex justify-center text-center">
                Welcome to @edgeserverio, this page is still under construction.
            </div>
        </div>
    );
};
