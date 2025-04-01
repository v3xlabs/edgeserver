import { createFileRoute } from '@tanstack/react-router';

import { SiteList } from '@/gui/site/SiteList';
import { TeamList } from '@/gui/team/TeamList';
import { SCPage } from '@/layouts';

export const Route = createFileRoute('/_authed/')({
    component: RouteComponent,
});

function RouteComponent() {
    return (
        <SCPage title="Home" hideHeader>
            <SiteList external />
            <TeamList />
        </SCPage>
    );
}
