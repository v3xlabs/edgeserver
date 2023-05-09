import { FC, useEffect } from 'react';
import { Outlet, useParams } from 'react-router';
import { useActiveTeam } from 'src/hooks/useTeam';

export const TeamContainer: FC = () => {
    const { team_id } = useParams<{ team_id: string }>();
    const { setActiveTeam } = useActiveTeam();

    useEffect(() => {
        setActiveTeam(team_id || '');
    }, [team_id]);

    return (
        <div className="pt-14">
            <Outlet context={{}} />
        </div>
    );
};
