import { createRootRouteWithContext, Outlet } from '@tanstack/react-router';
import { ReactNode } from 'react';

import { bootstrapPreflight } from '@/api';

// import { Toaster } from '@/gui/ui/Toaster';

export interface MyRouterContext {
    title: string;
    suffix?: ReactNode;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
    component: () => (
        <>
            {/* <Toaster /> */}
            <Outlet />
        </>
    ),
    beforeLoad: async ({ context, location }) => {
        if (
            location.pathname === '/bootstrap' ||
            location.pathname === '/debug'
        ) {
            return;
        }

        await bootstrapPreflight();
    },
});
