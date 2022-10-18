import {
    darkTheme,
    DisclaimerComponent,
    getDefaultWallets,
    RainbowKitProvider,
} from '@rainbow-me/rainbowkit';
import { QueryClient, QueryClientProvider } from 'react-query';
import { BrowserRouter } from 'react-router-dom';
import { chain, configureChains, createClient, WagmiConfig } from 'wagmi';
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc';
import { publicProvider } from 'wagmi/providers/public';

import { App } from './App';

const { chains, provider } = configureChains(
    [chain.mainnet, chain.polygon, chain.optimism, chain.arbitrum],
    [
        jsonRpcProvider({
            rpc: (chain) => {
                if (chain.id == 1) return { http: 'https://rpc.ankr.com/eth' };

                // eslint-disable-next-line unicorn/no-null
                return null;
            },
        }),
        jsonRpcProvider({
            rpc: (chain) => {
                if (chain.id == 1)
                    return { http: 'https://ethereum.publicnode.com' };

                // eslint-disable-next-line unicorn/no-null
                return null;
            },
        }),

        publicProvider(),
    ]
);

const { connectors } = getDefaultWallets({
    appName: 'Signal Edge',
    chains,
});

const wagmiClient = createClient({
    autoConnect: true,
    connectors,
    provider,
});

const queryClient = new QueryClient();

// eslint-disable-next-line react/prop-types
const Disclaimer: DisclaimerComponent = ({ Text, Link }) => (
    <Text>
        By connecting your wallet, you agree to the get rickrolled by the{' '}
        <Link href="https://www.youtube.com/watch?v=dQw4w9WgXcQ">
            Terms of Service
        </Link>{' '}
        and acknowledge you have lost{' '}
        <Link href="https://edgeserver.io/">The Game</Link>
    </Text>
);

export const Document = () => {
    return (
        <WagmiConfig client={wagmiClient}>
            <RainbowKitProvider
                chains={chains}
                theme={darkTheme()}
                appInfo={{
                    appName: 'Signal Edge',
                    disclaimer: Disclaimer,
                    learnMoreUrl: 'https://edgeserver.io/',
                }}
            >
                <QueryClientProvider client={queryClient}>
                    <BrowserRouter>
                        <div className="dark:text-white text-black-800 w-full min-h-screen">
                            {/* <LoginFacade> */}
                            <App />
                            {/* </LoginFacade> */}
                        </div>
                    </BrowserRouter>
                </QueryClientProvider>
            </RainbowKitProvider>
        </WagmiConfig>
    );
};
