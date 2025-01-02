import { createFileRoute } from '@tanstack/react-router';

import { useSites } from '@/api';

export const Route = createFileRoute('/_authed/')({
    component: RouteComponent,
});

function RouteComponent() {
    const { data: sites } = useSites();

    return <div>Hello {JSON.stringify(sites)}</div>;
}
