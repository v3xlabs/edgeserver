import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute(
    '/_authed/team/$teamId/settings/_s/webhooks'
)({
    component: RouteComponent,
});

function RouteComponent() {
    return <div className="card">Webhooks go here</div>;
}
