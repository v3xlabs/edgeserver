import { createFileRoute } from '@tanstack/react-router';

import { useTeams } from '@/api';
import { Button } from '@/components';
import { SCPage } from '@/layouts/SimpleCenterPage';

export const Route = createFileRoute('/_authed/site/new')({
    component: RouteComponent,
});

function RouteComponent() {
    const { data: teams } = useTeams();

    // TODO: have this select a team based on origin
    const teamId = teams?.[0]?.team_id;

    return (
        <SCPage title="Create Site">
            <div className="card">
                <div>Team: {teamId}</div>
                <div>Name: &apos;{name}&apos;</div>
                <div className="flex justify-end">
                    <Button>Create Site</Button>
                </div>
            </div>
        </SCPage>
    );
}
