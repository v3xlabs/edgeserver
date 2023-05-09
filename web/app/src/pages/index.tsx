import { AvatarOrGradient } from '@components/avatar/AvatarOrGradient';
import { SiteList } from '@components/sites/sitelist';
import { Team } from '@edgelabs/types';
import { buffercnvrt } from '@utils/buffercnvrt';
import { FC, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useActiveTeam } from 'src/hooks/useTeam';
import { useTeams } from 'src/hooks/useTeams';

export const Home = () => {
    const { setActiveTeam } = useActiveTeam();

    useEffect(() => {
        setActiveTeam('');
    }, []);

    return (
        <div className="w-container mt-8">
            <TeamList />
        </div>
    );
};

export const TeamList: FC = () => {
    const { data, mutate } = useTeams();

    return (
        <div className="flex flex-col gap-12">
            {data &&
                data.map((team) => (
                    <TeamEntry key={team.team_id} team={team} />
                ))}
        </div>
    );
};

export const TeamEntry: FC<{
    team: Team;
}> = ({ team }) => {
    return (
        <div className="">
            <div className="flex items-center gap-x-2">
                <AvatarOrGradient
                    src={buffercnvrt(team.icon as any) || ''}
                    hash={team.team_id}
                    className="h-11 w-11 overflow-hidden rounded-md"
                />
                <Link to={`/t/${team.team_id}`} className="block p-2">
                    <h3 className="text-xl font-bold">{team.name}</h3>
                    <span>{team.team_id}</span>
                </Link>
            </div>
            <SiteList team={team.team_id} />
        </div>
    );
};
