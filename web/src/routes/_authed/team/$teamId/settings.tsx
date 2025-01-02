import { createFileRoute } from '@tanstack/react-router';

import { SCPage } from '@/layouts';

export const Route = createFileRoute('/_authed/team/$teamId/settings')({
    component: RouteComponent,
});

function RouteComponent() {
    return (
        <SCPage title="Settings">
            <div className="card">Hello settings!</div>
        </SCPage>
    );
}
