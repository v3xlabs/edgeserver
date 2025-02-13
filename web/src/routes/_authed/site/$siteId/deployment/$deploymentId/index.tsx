import { createFileRoute } from '@tanstack/react-router';

import { useDeployment } from '@/api';
import { DeploymentContext } from '@/gui/deployments/context/context';
import { FileExplorer } from '@/gui/deployments/files/FileExplorer';
import { SCPage } from '@/layouts';

export const Route = createFileRoute(
    '/_authed/site/$siteId/deployment/$deploymentId/'
)({
    component: RouteComponent,
});

function RouteComponent() {
    const { siteId, deploymentId } = Route.useParams();
    const { data: deployment } = useDeployment(siteId, deploymentId);

    return (
        <SCPage title={`Deployment ${deploymentId}`}>
            <div className="card">This is the deployment page</div>
            {deployment && (
                <div className="card text-wrap break-words">
                    <pre className="w-full whitespace-break-spaces">
                        {JSON.stringify(deployment, undefined, 2)}
                    </pre>
                </div>
            )}
            {deployment?.context && (
                <DeploymentContext context={deployment.context} />
            )}
            <FileExplorer siteId={siteId} deploymentId={deploymentId} />
        </SCPage>
    );
}
