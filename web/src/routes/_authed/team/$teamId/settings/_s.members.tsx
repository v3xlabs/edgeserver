import { createFileRoute } from '@tanstack/react-router';

import { Button } from '@/components';
import { InviteList } from '@/gui/invite/InviteList';
import { TeamInviteCreateModal } from '@/gui/invite/TeamInviteCreateModal';
import { MemberList } from '@/gui/user/MemberList';

export const Route = createFileRoute(
    '/_authed/team/$teamId/settings/_s/members'
)({
    component: RouteComponent,
    context(context) {
        return {
            title: 'Members',
            suffix: (
                <TeamInviteCreateModal team_id={context.params.teamId}>
                    <Button>Invite Member</Button>
                </TeamInviteCreateModal>
            ),
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
