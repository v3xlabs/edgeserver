import { createFileRoute } from '@tanstack/react-router';

import { useSite } from '@/api';
import { Button, Input } from '@/components';
import { TeamSelect } from '@/components/select';

export const Route = createFileRoute('/_authed/site/$siteId/settings/_s/')({
    component: RouteComponent,
});

function RouteComponent() {
    const { siteId } = Route.useParams();
    const { data: site } = useSite(siteId);

    return (
        <div className="card space-y-4">
            <div>
                <div>Site Name</div>
                <div className="flex gap-2">
                    <Input value={site?.name} />
                    <Button onClick={() => alert('Not implemented')}>
                        Rename
                    </Button>
                </div>
            </div>
            <div>
                <div>Team</div>
                <div className="flex gap-2">
                    <TeamSelect value={site?.team_id} />
                    <Button onClick={() => alert('Not implemented')}>
                        Transfer
                    </Button>
                </div>
            </div>
        </div>
    );
}
