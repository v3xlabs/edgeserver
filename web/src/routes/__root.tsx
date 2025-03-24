import { createRootRouteWithContext, Outlet } from '@tanstack/react-router';
import { ReactNode } from 'react';
import { Toaster } from 'sonner';

import { bootstrapPreflight } from '@/api';

export interface MyRouterContext {
    title: string;
    suffix?: ReactNode;
    subtitle?: string;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
    component: () => (
        <>
            <Toaster />
            <Outlet />
        </>
    ),
    beforeLoad: async ({ context, location }) => {
        await bootstrapPreflight(location.pathname);
    },
});
