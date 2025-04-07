import {
    createFileRoute,
    Outlet,
    useNavigate,
    useRouterState,
} from '@tanstack/react-router';
import { useEffect } from 'react';

import { preflightAuth, useAuth } from '@/api';
import { CommandPalette } from '@/gui/command/CommandPalette';
import { Navbar } from '@/gui/navigation/Navbar';
import { Footer } from '@/components/footer';

export const Route = createFileRoute('/_authed')({
    component: RouteComponent,
    beforeLoad: async () => {
        await preflightAuth();
    },
});

function RouteComponent() {
    const matches = useRouterState({ select: (s) => s.matches });
    const { token } = useAuth();
    const navigate = useNavigate();

    // Not the primary redirect (see preflightAuth()) however this triggers when a user manually signs out
    useEffect(() => {
        if (!token) {
            navigate({
                to: '/login',
                search: { redirect: window.location.pathname },
            });
        }
    }, [token]);

    const { title, suffix } = matches[matches.length - 1].context;

    return (
        <>
            <Navbar />
            <CommandPalette />
            <Outlet />
            <Footer />
        </>
    );
}
