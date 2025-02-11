import { createFileRoute, Outlet } from '@tanstack/react-router';

import { preflightAuth } from '@/api';

export const Route = createFileRoute('/_authed/admin/_a')({
    component: RouteComponent,
    beforeLoad: async () => {
        await preflightAuth();
    },
});

function RouteComponent() {
    // const matches = useRouterState({ select: (s) => s.matches });

    // const { title, suffix } = matches[matches.length - 1].context;

    return (
        <>
            {/* <Navbar /> */}
            {/* <CommandPalette /> */}
            <Outlet />
        </>
    );
}
