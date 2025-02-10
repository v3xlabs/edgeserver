import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import { QueryClient } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { FC, PropsWithChildren } from 'react';

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            gcTime: 1000 * 60 * 60 * 24, // 24 hours
            staleTime: 1000 * 5, // 5 seconds
            retry: 1,
        },
    },
});

export const queryPersister = createSyncStoragePersister({
    storage: window.localStorage,
});

export const QueryProvider: FC<PropsWithChildren> = ({ children }) => {
    return (
        <PersistQueryClientProvider
            client={queryClient}
            persistOptions={{ persister: queryPersister }}
        >
            {children}
        </PersistQueryClientProvider>
    );
};
