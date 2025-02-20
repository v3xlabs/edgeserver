import { createFileRoute } from '@tanstack/react-router';

import { useTeam } from '@/api';
import { Button, Input } from '@/components';
import { TeamAvatarUpload } from '@/gui/settings/UploadAvatar';

export const Route = createFileRoute('/_authed/team/$teamId/settings/_s/')({
    component: RouteComponent,
});

function RouteComponent() {
    const { teamId } = Route.useParams();
    const { data: team } = useTeam(teamId);

    return (
        <div className="card space-y-4">
            <div>
                <div>Team Name</div>
                <div className="flex gap-2">
                    <Input value={team?.name} />
                    <Button onClick={() => alert('Not implemented')}>
                        Rename
                    </Button>
                </div>
            </div>
            {team && <TeamAvatarUpload team={team} />}
        </div>
    );
}
