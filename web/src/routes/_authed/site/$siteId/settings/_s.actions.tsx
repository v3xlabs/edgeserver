import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute(
    '/_authed/site/$siteId/settings/_s/actions'
)({
    component: RouteComponent,
});

function RouteComponent() {
    return <div className="card">Actions go here</div>;
}
