import { createFileRoute } from '@tanstack/react-router';

import { KeyTable } from '@/gui/keys';

export const Route = createFileRoute('/_authed/site/$siteId/settings/_s/keys')({
    context: () => {
        return {
            title: 'Site keys',
        };
    },
    component: RouteComponent,
});

function RouteComponent() {
    const { siteId } = Route.useParams();

    return <KeyTable siteId={siteId} />;
}
