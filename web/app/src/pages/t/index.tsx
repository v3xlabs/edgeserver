import { SiteList } from '@components/sites/sitelist';
import { useActiveTeam } from 'src/hooks/useTeam';

export const TeamPage = () => {
    const name = 'Team Page';
    const { team_id } = useActiveTeam();

    return (
        <div className="w-container">
            TeamPage
            <h1>{name}</h1>
            <SiteList team={team_id} />
        </div>
    );
};
