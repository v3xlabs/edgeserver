import { createFileRoute } from '@tanstack/react-router';

import { getSite, useSite } from '@/api';
import { DeploymentList } from '@/gui/deployments/DeploymentList';
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
            <div className="card">This is the site page</div>
            <DeploymentList siteId={siteId} />
        </SCPage>
    );
}
