import { createFileRoute } from '@tanstack/react-router';

import { getTeam, useTeam } from '@/api';
import { SiteList } from '@/gui/site/SiteList';
import { SCPage } from '@/layouts';
import { queryClient } from '@/util/query';

export const Route = createFileRoute('/_authed/team/$teamId/')({
    component: RouteComponent,
    loader: async ({ params }) => {
        const { teamId } = params;

        await queryClient.ensureQueryData(getTeam(teamId));
    },
});

function RouteComponent() {
    const { teamId } = Route.useParams();
    const { data: team } = useTeam(teamId);

    return (
        <SCPage title={team?.name ?? 'Team'}>
            <div>Hello /_authed/team/$teamId/!</div>
            <SiteList teamId={teamId} />
        </SCPage>
    );
}
