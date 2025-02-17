import { createRootRouteWithContext, Outlet } from '@tanstack/react-router';
import { ReactNode } from 'react';

import { bootstrapPreflight } from '@/api';

// import { Toaster } from '@/gui/ui/Toaster';

export interface MyRouterContext {
    title: string;
    suffix?: ReactNode;
    subtitle?: string;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
    component: () => (
        <>
            {/* <Toaster /> */}
            <Outlet />
        </>
    ),
    beforeLoad: async ({ context, location }) => {
        await bootstrapPreflight(location.pathname);
    },
});
