import { createFileRoute } from '@tanstack/react-router';

import { MemberList } from '@/gui/user/MemberList';

export const Route = createFileRoute(
    '/_authed/team/$teamId/settings/_s/members'
)({
    component: RouteComponent,
});

function RouteComponent() {
    const { teamId } = Route.useParams();

    return (
        <>
            <div className="card">Hello members!</div>
            <MemberList team_id={teamId} />
        </>
    );
}
