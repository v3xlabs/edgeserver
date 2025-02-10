import { createFileRoute } from '@tanstack/react-router';

import { InviteList } from '@/gui/invite/InviteList';
import { MemberList } from '@/gui/user/MemberList';

export const Route = createFileRoute(
    '/_authed/team/$teamId/settings/_s/members'
)({
    component: RouteComponent,
    context(context) {
        return {
            title: 'Members',
        };
    },
});

function RouteComponent() {
    const { teamId } = Route.useParams();

    return (
        <>
            <MemberList team_id={teamId} />
            <InviteList team_id={teamId} />
        </>
    );
}
