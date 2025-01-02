import { createFileRoute } from '@tanstack/react-router';

import { SCPage } from '@/layouts';

export const Route = createFileRoute('/_authed/site/$siteId/analytics')({
    component: RouteComponent,
});

function RouteComponent() {
    return (
        <SCPage title="Analytics">
            <div className="card">Analytics here</div>
        </SCPage>
    );
}
