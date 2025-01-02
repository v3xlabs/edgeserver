import {
    createFileRoute,
    Outlet,
    useRouterState,
} from '@tanstack/react-router';

import { preflightAuth } from '@/api';
import { CommandPalette } from '@/gui/command/CommandPalette';
import { Navbar } from '@/gui/navigation/Navbar';

export const Route = createFileRoute('/_authed')({
    component: RouteComponent,
    beforeLoad: async () => {
        await preflightAuth();
    },
});

function RouteComponent() {
    const matches = useRouterState({ select: (s) => s.matches });

    const { title, suffix } = matches[matches.length - 1].context;

    return (
        <>
            <Navbar />
            <CommandPalette />
            <Outlet />
        </>
    );
}
