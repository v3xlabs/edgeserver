import { createFileRoute } from '@tanstack/react-router';

import { MemberList } from '@/gui/user/MemberList';
import { SCPage } from '@/layouts';

export const Route = createFileRoute('/_authed/team/$teamId/members')({
    component: RouteComponent,
});

function RouteComponent() {
    const { teamId } = Route.useParams();

    return (
        <SCPage title="Members">
            <div className="card">Hello members!</div>
            <MemberList team_id={teamId} />
        </SCPage>
    );
}
