import { createRootRouteWithContext, Outlet } from '@tanstack/react-router';
import { ReactNode } from 'react';

// import { Toaster } from '@/components/ui/Toaster';

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
});
