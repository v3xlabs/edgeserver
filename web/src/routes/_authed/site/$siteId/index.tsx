import { createFileRoute } from '@tanstack/react-router';

import { getSite, useSite } from '@/api';
import { SCPage } from '@/layouts';
import { queryClient } from '@/util/query';

export const Route = createFileRoute('/_authed/site/$siteId/')({
    component: RouteComponent,
    loader: async ({ params }) => {
        const { siteId } = params;

        await queryClient.ensureQueryData(getSite(siteId));
    },
});

function RouteComponent() {
    const { siteId } = Route.useParams();
    const { data: site } = useSite(siteId);

    return (
        <SCPage title={site?.name ?? 'Site'}>
            <div>Hello /_authed/site/$siteId/!</div>
        </SCPage>
    );
}
