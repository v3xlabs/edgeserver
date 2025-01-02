import { createFileRoute } from '@tanstack/react-router';

import { SiteList } from '@/gui/site/SiteList';
import { SCPage } from '@/layouts';

export const Route = createFileRoute('/_authed/team/$teamId/sites')({
    component: RouteComponent,
});

function RouteComponent() {
    const { teamId } = Route.useParams();

    return (
        <SCPage title="Sites">
            <div className="card">Sites go here brr</div>
            <SiteList teamId={teamId} />
        </SCPage>
    );
}
