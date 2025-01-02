import { createFileRoute } from '@tanstack/react-router';

import { useTeams } from '@/api';
import { SCPage } from '@/layouts';

export const Route = createFileRoute('/_authed/')({
    component: RouteComponent,
});

function RouteComponent() {
    const { data: teams } = useTeams();

    return (
        <SCPage title="Home">
            <div className="card">Hello {JSON.stringify(teams)}</div>
        </SCPage>
    );
}
