import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute(
    '/_authed/site/$siteId/settings/_s/domains'
)({
    component: RouteComponent,
});

function RouteComponent() {
    return <div className="card">Domains go here</div>;
}
