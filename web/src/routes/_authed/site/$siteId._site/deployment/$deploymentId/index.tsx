import { createFileRoute } from '@tanstack/react-router';
import { useMemo } from 'react';
import { FiGithub, FiMoreHorizontal } from 'react-icons/fi';
import { LuCopy, LuPictureInPicture } from 'react-icons/lu';
import { SiIpfs } from 'react-icons/si';
import { toast } from 'sonner';

import {
    useDeployment,
    useDeploymentPreviewRefetch,
    useDeploymentPreviews,
} from '@/api';
import { useIPFSStatus } from '@/api/system';
import { Button, Input } from '@/components';
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
import { combineIpfsClusterUrl } from '@/util/ipfs';

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
            return context.data.commit?.url?.split('/commit/')[0];
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
            {!!deployment?.ipfs_cid && (
                <div className="card space-y-1">
                    <div className="flex items-center gap-1.5 pl-0.5">
                        <SiIpfs />
                        <div className="font-bold">
                            Interplanetary File System
                        </div>
                    </div>
                    <p>
                        Your page has been deployed to IPFS and is pinned. You
                        can set the CID in your ENS name or share it directly
                    </p>
                    <div className="flex w-full items-center gap-2">
                        <Input
                            value={'ipfs://' + deployment.ipfs_cid}
                            readOnly
                            className="w-full"
                        />
                        <Button
                            size="icon"
                            onClick={() => {
                                navigator.clipboard.writeText(
                                    'ipfs://' + deployment.ipfs_cid
                                );
                                toast.success('Copied to clipboard');
                            }}
                        >
                            <LuCopy />
                        </Button>
                    </div>
                </div>
            )}
            <FileExplorer siteId={siteId} deploymentId={deploymentId} />
        </SCPage>
    );
}
