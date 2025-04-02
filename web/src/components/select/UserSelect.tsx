import { FC } from 'react';

import { useUsers } from '@/api';
import { useTeamMembers } from '@/api/team';

import {
    FieldSelect,
    FieldSelectProperties as FieldSelectProperties,
} from '../select/FieldSelect';

export const UserSelect: FC<
    {
        value: string;
        name?: string;
        forceCategory?: string;
        teamId: string;
        onChange: (_value: string) => void;
    } & Partial<FieldSelectProperties>
> = ({ value, name, forceCategory, teamId, onChange, ...properties }) => {
    const { data: users } = useUsers();
    const { data: teamMembers } = useTeamMembers(teamId);

    const options = (users || [])
        .filter((user) => {
            if (!teamMembers) return true;

            return !teamMembers.some(
                (member) => member.user_id === user.user_id
            );
        })
        .map((user) => ({
            label: user.name,
            value: user.user_id,
        }));

    return (
        <FieldSelect
            {...properties}
            label={name}
            options={options}
            value={value ?? ''}
            popoverWidth="420"
            justifyBetween
            onChange={(value) => {
                onChange(value);

                return true;
            }}
        />
    );
};
