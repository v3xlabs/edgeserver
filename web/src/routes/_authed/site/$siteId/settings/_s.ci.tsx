import { createFileRoute } from '@tanstack/react-router';
import { LuGitBranch } from 'react-icons/lu';

export const Route = createFileRoute('/_authed/site/$siteId/settings/_s/ci')({
    component: RouteComponent,
    context: () => ({
        title: 'CI/CD',
        subtitle: 'Manage your site CI/CD',
    }),
});

function RouteComponent() {
    return (
        <div className="card flex flex-row items-center justify-center gap-2">
            <LuGitBranch className="text-4xl" />
            <div className="flex flex-col justify-center gap-1">
                <div className="text-base font-bold">Coming soon</div>
                <div className="text-sm text-gray-500">
                    We&apos;re working on it!
                </div>
            </div>
        </div>
    );
}
