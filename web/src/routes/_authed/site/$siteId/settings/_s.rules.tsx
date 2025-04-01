import { createFileRoute } from '@tanstack/react-router';
import { LuFilter } from 'react-icons/lu';

export const Route = createFileRoute('/_authed/site/$siteId/settings/_s/rules')(
    {
        component: RouteComponent,
        context: () => ({
            title: 'Routing Rules',
            subtitle: 'Manage your site routing logic',
        }),
    }
);

function RouteComponent() {
    return (
        <div className="card flex flex-row items-center justify-center gap-2">
            <LuFilter className="text-4xl" />
            <div className="flex flex-col justify-center gap-1">
                <div className="text-base font-bold">Coming soon</div>
                <div className="text-sm text-gray-500">
                    We&apos;re working on it!
                </div>
            </div>
        </div>
    );
}
