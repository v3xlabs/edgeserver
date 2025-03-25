import { createFileRoute } from '@tanstack/react-router';
import { FiMoreHorizontal } from 'react-icons/fi';

import {
    useDeployment,
    useDeploymentPreviewRefetch,
    useDeploymentPreviews,
} from '@/api';
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
    const { mutate: refreshDeploymentPreview } = useDeploymentPreviewRefetch(
        siteId,
        deploymentId
    );
    const { data: previews } = useDeploymentPreviews(siteId, deploymentId);

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
                        <DropdownMenuItem
                            onClick={() => {
                                refreshDeploymentPreview();
                            }}
                        >
                            Refresh Preview
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            }
        >
            <div className="card">
                <div className="aspect-video w-full max-w-sm overflow-hidden rounded-md bg-gray-100">
                    {previews && previews.length > 0 && (
                        <img
                            src={previews[0].file_path}
                            alt="Deployment Preview"
                            className="size-full object-cover"
                        />
                    )}
                </div>
            </div>
            {deployment?.context && (
                <DeploymentContext context={deployment.context} />
            )}
            <FileExplorer siteId={siteId} deploymentId={deploymentId} />
        </SCPage>
    );
}
