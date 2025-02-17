import { createFileRoute, useParams } from '@tanstack/react-router';

import { useTeam } from '@/api';
import TeamUserTransfer from '@/gui/transferDialog/teamUserTransfer';

export const Route = createFileRoute(
    '/_authed/team/$teamId/settings/_s/transfer'
)({
    component: RouteComponent,
});

function RouteComponent() {
    const { teamId } = useParams({ strict: false });
    const { data: team } = useTeam(teamId);

    return (
        <div className="card">
            <div>
                <div>Owner</div>
                <div className="flex gap-2">
                    <TeamUserTransfer prefillId={team?.owner_id} />
                </div>
            </div>
        </div>
    );
}
