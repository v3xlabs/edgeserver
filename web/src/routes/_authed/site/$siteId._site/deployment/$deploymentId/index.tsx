import { createFileRoute } from '@tanstack/react-router';
import { useMemo } from 'react';
import { FiGithub, FiMoreHorizontal } from 'react-icons/fi';
import { LuPictureInPicture } from 'react-icons/lu';
import { SiIpfs } from 'react-icons/si';
import { toast } from 'sonner';

import {
    useDeployment,
    useDeploymentPreviewRefetch,
    useDeploymentPreviews,
} from '@/api';
import { useIPFSStatus } from '@/api/system';
import { Button } from '@/components';
import {
    DeploymentContext,
    parseDeploymentContext,
} from '@/gui/deployments/context/context';
import { FileExplorer } from '@/gui/deployments/files/FileExplorer';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/gui/Dropdown';
import { SCPage } from '@/layouts';

export const Route = createFileRoute(
    '/_authed/site/$siteId/_site/deployment/$deploymentId/'
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

    const { data: ipfsStatus } = useIPFSStatus();
    const cluster_url =
        typeof ipfsStatus === 'object' ? ipfsStatus.public_cluster_url : '';

    const githubRootUrl = useMemo(() => {
        if (!deployment?.context) return;

        const context = parseDeploymentContext(deployment.context);

        if (context.contextType === 'github-action') {
            return context.data.commit.url.split('/commit/')[0];
        }
    }, [deployment]);

    return (
        <SCPage
            title="Deployment Details"
            suffix={
                <div className="flex items-center justify-end gap-2">
                    {deployment?.ipfs_cid && cluster_url && (
                        <Button asChild>
                            <a
                                href={combineIpfsClusterUrl(
                                    cluster_url,
                                    deployment.ipfs_cid
                                )}
                                target="_blank"
                                rel="noreferrer"
                            >
                                <SiIpfs />
                                <span>View on IPFS</span>
                            </a>
                        </Button>
                    )}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button size="icon">
                                <FiMoreHorizontal />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {githubRootUrl && (
                                <DropdownMenuItem asChild>
                                    <a
                                        href={githubRootUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="cursor-pointer"
                                    >
                                        <FiGithub />
                                        <span className="pr-4">
                                            View on GitHub
                                        </span>
                                    </a>
                                </DropdownMenuItem>
                            )}

                            <DropdownMenuItem
                                onClick={() => {
                                    refreshDeploymentPreview();
                                    toast.success(
                                        'Preview regeneration queued'
                                    );
                                }}
                            >
                                <LuPictureInPicture />
                                <span>Refresh Preview</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            }
        >
            {deployment?.context && (
                <DeploymentContext
                    context={deployment.context}
                    siteId={siteId}
                    deploymentId={deploymentId}
                />
            )}
            <FileExplorer siteId={siteId} deploymentId={deploymentId} />
        </SCPage>
    );
}

const combineIpfsClusterUrl = (cluster_url: string, cid: string) => {
    const DELIMITER = '%CID%';

    if (cluster_url.includes(DELIMITER)) {
        return cluster_url.replace(DELIMITER, cid);
    }

    const cluster_url_suffixed_with_slash = cluster_url.endsWith('/')
        ? cluster_url
        : `${cluster_url}/`;
    const cluster_url_with_ipfs = cluster_url_suffixed_with_slash.includes(
        'ipfs/'
    )
        ? cluster_url_suffixed_with_slash
        : `${cluster_url_suffixed_with_slash}ipfs/`;

    return `${cluster_url_with_ipfs}${cid}`;
};
