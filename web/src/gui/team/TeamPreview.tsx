import { Link } from '@tanstack/react-router';
import { FC } from 'react';
import { FiArrowRight } from 'react-icons/fi';

import { Team, useTeam } from '@/api/team';

export const TeamPreview: FC<{ team_id?: string; team?: Team }> = ({
    team_id: query_team_id,
    team: query_team,
}) => {
    const team_id = query_team_id ?? query_team?.team_id;

    if (!team_id) return;

    const { data: team_data } = useTeam(team_id);
    const team = query_team ?? team_data;

    return (
        <Link
            to="/team/$teamId"
            params={{ teamId: team_id }}
            className="card flex items-center justify-between"
        >
            <div>{team?.name}</div>
            <FiArrowRight />
        </Link>
    );
};
