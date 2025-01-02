import { createFileRoute } from '@tanstack/react-router';

import { SCPage } from '@/layouts';

export const Route = createFileRoute('/_authed/team/$teamId/members')({
    component: RouteComponent,
});

function RouteComponent() {
    return (
        <SCPage title="Members">
            <div className="card">Hello members!</div>
        </SCPage>
    );
}
