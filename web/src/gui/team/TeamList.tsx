import { useTeams } from '@/api';
import { TeamPreview } from '@/gui/team/TeamPreview';

export const TeamList = () => {
    const { data: teams } = useTeams();

    return (
        <div>
            <h2 className="h2">Teams</h2>
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
