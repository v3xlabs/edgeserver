import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_authed/settings/_s/')({
    component: RouteComponent,
});

function RouteComponent() {
    return <div>Hello</div>;
}
