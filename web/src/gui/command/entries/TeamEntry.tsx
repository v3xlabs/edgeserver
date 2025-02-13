import { Command } from 'cmdk';
import { FC } from 'react';

import { useTeam, useTeams } from '@/api';
import { Avatar } from '@/components';

export const TeamEntry: FC<{ team_id: string }> = ({ team_id }) => {
    const { data: team } = useTeam(team_id);

    // const search: string = useCommandState((state) => state.search);

    if (!team) return <></>;

    return (
        <Command.Item keywords={[team.name]}>
            <span className="flex w-full items-center gap-2">
                <div className="size-4">
                    <Avatar src={team.team_id} />
                </div>
                {team?.name}
            </span>
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
