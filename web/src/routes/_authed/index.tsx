import { createFileRoute } from '@tanstack/react-router';

import { useTeams } from '@/api';
import { SiteList } from '@/gui/site/SiteList';
import { TeamList } from '@/gui/team/TeamList';
import { SCPage } from '@/layouts';

export const Route = createFileRoute('/_authed/')({
    component: RouteComponent,
});

function RouteComponent() {
    const { data: teams } = useTeams();

    return (
        <SCPage title="Home" hideHeader>
            <SiteList external />
            <TeamList />
        </SCPage>
    );
}
