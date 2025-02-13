import { Command } from 'cmdk';
import { FC } from 'react';
import { FiUsers } from 'react-icons/fi';

import { useTeam, useTeams } from '@/api';
import { Avatar } from '@/components';

export const TeamEntry: FC<{ team_id: string }> = ({ team_id }) => {
    const { data: team } = useTeam(team_id);

    // const search: string = useCommandState((state) => state.search);

    if (!team) return <></>;

    return (
        <Command.Item
            keywords={[team.name, team.team_id]}
            className="flex items-center justify-between"
        >
            <div className="flex w-full items-center gap-2">
                <div className="size-4">
                    <Avatar src={team.team_id} />
                </div>

                <div>{team.name}</div>
            </div>
            <div className="text-muted flex items-center gap-1">
                <FiUsers className="text-sm" />
                <span>team</span>
            </div>
            {/* {command.style === 'navigate' && (
                <FiArrowRight className="size-4 opacity-50" />
            )} */}
        </Command.Item>
    );
};

export const TeamEntries = () => {
    const { data: teams } = useTeams();

    return (
        <Command.Group heading="Teams">
            {teams?.map((team) => (
                <TeamEntry key={team.team_id} team_id={team.team_id} />
            ))}
        </Command.Group>
    );
};
