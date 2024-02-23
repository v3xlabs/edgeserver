import { LoginFacade } from '@components/LoginFacade';
import { environment } from '@utils/environment';
import { localStorageProvider } from '@utils/swrStorage';
import { BrowserRouter } from 'react-router-dom';
import { SWRConfig } from 'swr';
import { createPublicClient, http } from 'viem';
import { WagmiProvider, createConfig } from 'wagmi';

import { App } from './App';
import { useAuthState } from './hooks/useAuth';
import { mainnet } from 'viem/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const config = createConfig({
    chains: [mainnet]
});

const queryClient = new QueryClient({});

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
            <QueryClientProvider client={queryClient}>
            <WagmiProvider config={config}>
                <BrowserRouter>
                    <div className="text-black-800 min-h-screen w-full dark:text-white">
                        <LoginFacade>
                            <App />
                        </LoginFacade>
                    </div>
                </BrowserRouter>
            </WagmiProvider>
            </QueryClientProvider>
        </SWRConfig>
    );
};
