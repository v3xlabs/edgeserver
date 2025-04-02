import { createFileRoute, Link } from '@tanstack/react-router';
import { FC, useMemo } from 'react';
import { FiGithub, FiMoreHorizontal } from 'react-icons/fi';
import { SiIpfs } from 'react-icons/si';

import { getSite, useLastDeployment, useSite, useSiteDomains } from '@/api';
import { useIPFSStatus } from '@/api/system';
import { Button } from '@/components';
import { parseDeploymentContext } from '@/gui/deployments/context/context';
import { DeploymentList } from '@/gui/deployments/DeploymentList';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/gui/Dropdown';
import { SCPage } from '@/layouts';
import { combineIpfsClusterUrl } from '@/util/ipfs';
import { queryClient } from '@/util/query';

import { MiniDomainPreview } from './settings/_s.domains';

export const Route = createFileRoute('/_authed/site/$siteId/_site/')({
    component: RouteComponent,
    loader: async ({ params }) => {
        const { siteId } = params;

        await queryClient.ensureQueryData(getSite(siteId));
    },
});

function RouteComponent() {
    const { siteId } = Route.useParams();
    const { data: site } = useSite(siteId);
    const { data: deployment } = useLastDeployment(siteId);
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
            title={site?.name ?? 'Site'}
            suffix={
                <div className="flex items-center gap-2">
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
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            }
        >
            <div className="flex w-full gap-4">
                <div className="card grow">This is the site page</div>
                <SiteDomainsListPreview siteId={siteId} />
            </div>
            <DeploymentList siteId={siteId} max={3} />
        </SCPage>
    );
}

export const SiteDomainsListPreview: FC<{
    siteId: string;
}> = ({ siteId }) => {
    const { data: domains } = useSiteDomains(siteId);

    return (
        <div className="card">
            <div className="font-bold">Domains</div>
            <ul className="flex flex-col gap-2 md:min-w-60">
                {domains?.map((domain) => (
                    <li key={domain.domain}>
                        <MiniDomainPreview domain={domain} />
                    </li>
                ))}
                {domains?.length === 0 && (
                    <div className="space-y-2">
                        <div className="text-muted">No domains found</div>
                        <div className="flex justify-end">
                            <Button asChild>
                                <Link
                                    to="/site/$siteId/settings/domains"
                                    params={{ siteId }}
                                >
                                    Add a domain
                                </Link>
                            </Button>
                        </div>
                    </div>
                )}
            </ul>
        </div>
    );
};
