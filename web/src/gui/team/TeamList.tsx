import { useTeams } from '@/api';
import { TeamPreview } from '@/gui/team/TeamPreview';

import { TeamCreateButton } from './TeamCreateButton';

export const TeamList = () => {
    const { data: teams } = useTeams();

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <h2 className="h2">Teams</h2>
                <TeamCreateButton />
            </div>
            <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {teams?.map((team) => (
                    <li key={team.team_id}>
                        <TeamPreview team={team} />
                    </li>
                ))}
            </ul>
        </div>
    );
};
