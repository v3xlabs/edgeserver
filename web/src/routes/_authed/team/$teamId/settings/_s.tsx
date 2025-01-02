import {
    createFileRoute,
    Outlet,
    useRouterState,
} from '@tanstack/react-router';

import { TeamSettingsNav } from '@/gui/team/TeamSettingsNav';
import { SidePage } from '@/layouts';

export const Route = createFileRoute('/_authed/team/$teamId/settings/_s')({
    component: RouteComponent,
});

function RouteComponent() {
    const matches = useRouterState({ select: (s) => s.matches });

    const { title, suffix } = matches[matches.length - 1].context;

    return (
        <SidePage title={title} suffix={suffix} sidebar={<TeamSettingsNav />}>
            <Outlet />
        </SidePage>
    );
}
