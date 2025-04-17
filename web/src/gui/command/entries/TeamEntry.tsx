import { useNavigate } from '@tanstack/react-router';
import { Command } from 'cmdk';
import { FC } from 'react';
import { FiUsers } from 'react-icons/fi';

import { useTeam, useTeams } from '@/api';
import { Avatar } from '@/components';

import { useCommand } from '../CommandPalette';

export const TeamEntry: FC<{ team_id: string }> = ({ team_id }) => {
    const { data: team } = useTeam(team_id);
    const navigate = useNavigate();
    const { requestClose } = useCommand();

    if (!team) return <></>;

    return (
        <Command.Item
            keywords={[team.name, team.team_id]}
            className="flex items-center justify-between"
            onSelect={() => {
                navigate({
                    to: '/team/$teamId',
                    params: {
                        teamId: team_id,
                    },
                });
                requestClose();
            }}
        >
            <div className="flex w-full items-center gap-2">
                <div className="size-4">
                    <Avatar src={team.team_id} />
                </div>

                <div>{team.name}</div>
            </div>
            <div className="flex items-center gap-1 text-muted">
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
