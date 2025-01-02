import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute(
    '/_authed/site/$siteId/settings/_s/transfer'
)({
    component: RouteComponent,
});

function RouteComponent() {
    return <div className="card">Transfer go here</div>;
}
