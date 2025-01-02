import {
    createFileRoute,
    Outlet,
    useRouterState,
} from '@tanstack/react-router';

import { Navbar } from '@/gui/Navbar/Navbar';

export const Route = createFileRoute('/_authed')({
    component: RouteComponent,
});

function RouteComponent() {
    const matches = useRouterState({ select: (s) => s.matches });

    const { title, suffix } = matches[matches.length - 1].context;

    return (
        <>
            <Navbar />
            <Outlet />
        </>
    );
}
