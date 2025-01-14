import { createFileRoute } from '@tanstack/react-router';

import { DeploymentList } from '@/gui/deployments/DeploymentList';
import { SCPage } from '@/layouts';

export const Route = createFileRoute('/_authed/site/$siteId/deployments')({
    component: RouteComponent,
});

function RouteComponent() {
    const { siteId } = Route.useParams();

    return (
        <SCPage title="Deployments">
            <div className="card">Deployments here</div>
            <DeploymentList siteId={siteId} />
        </SCPage>
    );
}
