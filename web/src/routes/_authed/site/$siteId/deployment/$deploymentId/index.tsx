import { createFileRoute } from '@tanstack/react-router';
import { FiMoreHorizontal } from 'react-icons/fi';

import { useDeployment } from '@/api';
import { Button } from '@/components';
import { DeploymentContext } from '@/gui/deployments/context/context';
import { FileExplorer } from '@/gui/deployments/files/FileExplorer';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/gui/Dropdown';
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
        <SCPage
            title="Deployment Details"
            suffix={
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button size="icon">
                            <FiMoreHorizontal />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem>Hello world</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            }
        >
            {deployment?.context && (
                <DeploymentContext context={deployment.context} />
            )}
            <FileExplorer siteId={siteId} deploymentId={deploymentId} />
        </SCPage>
    );
}
