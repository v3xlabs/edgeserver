import { LoginFacade } from '@components/LoginFacade';
import { environment } from '@utils/environment';
import { localStorageProvider } from '@utils/swrStorage';
import {
    ConnectKitProvider,
    getDefaultClient,
    SIWEConfig,
    SIWEProvider,
    SIWESession,
} from 'connectkit';
import { BrowserRouter } from 'react-router-dom';
import { SiweMessage } from 'siwe';
import { SWRConfig } from 'swr';
import { configureChains, createClient, WagmiConfig } from 'wagmi';
import { arbitrum, mainnet, optimism, polygon } from 'wagmi/chains';
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc';
import { publicProvider } from 'wagmi/providers/public';

import { App } from './App';
import { useAuthState } from './hooks/useAuth';

const { chains, provider } = configureChains(
    [mainnet, polygon, optimism, arbitrum],
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

const defaultClient = getDefaultClient({
    appName: 'Edgeserver',
    provider,
    chains,
});

const wagmiClient = createClient({
    ...defaultClient,
});

const siweConfig: SIWEConfig = {
    createMessage: ({ address, chainId, nonce }) => {
        localStorage.setItem('address', address);
        localStorage.setItem('chain_id', chainId.toString());

        return new SiweMessage({
            version: '1',
            domain: window.location.host,
            uri: window.location.origin,
            address,
            chainId: 0,
            nonce,
            statement: 'Sign in with Ethereum.',
        }).prepareMessage();
    },
    // TODO: make fancy
    getNonce: async () => {
        return Date.now().toString();
    },
    verifyMessage: async ({ message, signature }) => {
        const result = await fetch(environment.API_URL + '/siwe/verify', {
            method: 'post',
            body: JSON.stringify({ message, signature }),
        });

        const { token } = (await result.json()) as { token: string };

        useAuthState.setState({ auth_token: token });

        return result.status == 200;
    },
    getSession: async () => {
        const token = useAuthState.getState().auth_token;

        // eslint-disable-next-line unicorn/no-null
        if (!token) return null;

        const headers = new Headers();

        headers.append('authorization', 'Bearer ' + token);

        const result = await fetch(environment.API_URL + '/siwe/session', {
            method: 'get',
            headers,
        });

        if (result.status == 200)
            return {
                address: localStorage.getItem('address'),
                chainId: 0,
            } as SIWESession;

        // eslint-disable-next-line unicorn/no-null
        return null;
    },
    signOut: async () => {
        useAuthState.setState({ auth_token: '' });

        return true;
    },
};

export const Document = () => {
    return (
        <SWRConfig
            value={{
                dedupingInterval: 2000,
                revalidateOnFocus: true,
                revalidateOnMount: true,
                provider: localStorageProvider,
                fetcher: async (url) => {
                    const token = useAuthState.getState().auth_token;

                    const headers = new Headers();

                    headers.append('authorization', 'Bearer ' + token);

                    const result = await fetch(environment.API_URL + url, {
                        headers,
                    });

                    return await result.json();
                },
            }}
        >
            <WagmiConfig client={wagmiClient}>
                <SIWEProvider {...siweConfig}>
                    <ConnectKitProvider>
                        <BrowserRouter>
                            <div className="text-black-800 min-h-screen w-full dark:text-white">
                                <LoginFacade>
                                    <App />
                                </LoginFacade>
                            </div>
                        </BrowserRouter>
                    </ConnectKitProvider>
                </SIWEProvider>
            </WagmiConfig>
        </SWRConfig>
    );
};
