import './index.scss';

import { QueryClientProvider } from '@tanstack/react-query';
import { createRouter, RouterProvider } from '@tanstack/react-router';
import React from 'react';
import ReactDOM from 'react-dom/client';

import { preflightAuth } from '@/api/auth';
// Import the generated route tree
import { routeTree } from '@/routeTree.gen';
import { queryClient } from '@/util/query';

import { PageErrorBoundary } from './gui/PageErrorBoundary';
import { defaultPendingComponent } from './gui/Router';

// Create a new router instance
const router = createRouter({
    routeTree,
    defaultPendingComponent,
    defaultErrorComponent: PageErrorBoundary,
    context: {
        title: 'Property',
    },
});

// Register the router instance for type safety
declare module '@tanstack/react-router' {
    // eslint-disable-next-line prettier/prettier, unused-imports/no-unused-vars
  interface Register {
        router: typeof router;
    }
}

preflightAuth();

ReactDOM.createRoot(document.querySelector('#root')!).render(
    <React.StrictMode>
        <QueryClientProvider client={queryClient}>
            <RouterProvider router={router} />
        </QueryClientProvider>
    </React.StrictMode>
);
