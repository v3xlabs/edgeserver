import { createFileRoute } from '@tanstack/react-router';

import { SiteCreateButton } from '@/gui/site/SiteCreateButton';
import { SiteList } from '@/gui/site/SiteList';
import { SCPage } from '@/layouts';

export const Route = createFileRoute('/_authed/team/$teamId/sites')({
    component: RouteComponent,
});

function RouteComponent() {
    const { teamId } = Route.useParams();

    return (
        <SCPage title="Sites" suffix={<SiteCreateButton team_id={teamId} />}>
            <SiteList teamId={teamId} showHeader={false} />
        </SCPage>
    );
}
