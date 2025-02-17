import { createFileRoute } from '@tanstack/react-router';

import { useSite } from '@/api';
import SiteTeamTransfer from '@/gui/transferDialog/siteTeamTransfer';

export const Route = createFileRoute(
    '/_authed/site/$siteId/settings/_s/transfer'
)({
    component: RouteComponent,
});

function RouteComponent() {
    const { siteId } = Route.useParams();
    const { data: site } = useSite(siteId);

    return (
        <div className="card">
            <div>
                <div>Team</div>
                <SiteTeamTransfer prefillId={site?.team_id} siteId={siteId} />
            </div>
        </div>
    );
}
