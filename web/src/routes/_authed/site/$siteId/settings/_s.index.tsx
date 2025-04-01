import { createFileRoute } from '@tanstack/react-router';

import { useSite } from '@/api';
import { Button, Input } from '@/components';

export const Route = createFileRoute('/_authed/site/$siteId/settings/_s/')({
    component: RouteComponent,
    context: () => ({
        title: 'Site Settings',
        subtitle: 'Manage your site settings',
    }),
});

function RouteComponent() {
    const { siteId } = Route.useParams();
    const { data: site } = useSite(siteId);

    return (
        <div className="card space-y-4">
            <div className="space-y-2">
                <div className="font-bold">Site Name</div>
                <div className="flex gap-2">
                    <Input value={site?.name} />
                    <Button onClick={() => alert('Not implemented')}>
                        Rename
                    </Button>
                </div>
            </div>
        </div>
    );
}
