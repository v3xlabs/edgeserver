import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_authed/team/$teamId/')({
    component: RouteComponent,
});

function RouteComponent() {
    return <div>Hello /_authed/team/$teamId/!</div>;
}
