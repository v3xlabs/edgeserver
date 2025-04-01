import { createFileRoute } from '@tanstack/react-router';
import { SiIpfs } from 'react-icons/si';

export const Route = createFileRoute('/_authed/site/$siteId/settings/_s/ipfs')({
    component: RouteComponent,
    context: () => ({
        title: 'IPFS',
        subtitle: 'Deploy your site to IPFS',
    }),
});

function RouteComponent() {
    return (
        <div className="card flex flex-row items-center justify-center gap-2">
            <SiIpfs className="text-4xl" />
            <div className="flex flex-col justify-center gap-1">
                <div className="text-base font-bold">Coming soon</div>
                <div className="text-sm text-gray-500">
                    We&apos;re working on it!
                </div>
            </div>
        </div>
    );
}
