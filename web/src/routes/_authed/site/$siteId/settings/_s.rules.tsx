import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_authed/site/$siteId/settings/_s/rules')(
    {
        component: RouteComponent,
    }
);

function RouteComponent() {
    return <div className="card">Rules go here</div>;
}
