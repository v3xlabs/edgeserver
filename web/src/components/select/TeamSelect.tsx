import { FC } from 'react';

import { useTeams } from '@/api';

import {
    FieldSelect,
    FieldSelectProperties as FieldSelectProperties,
} from '../select/FieldSelect';

export const TeamSelect: FC<
    {
        value: string;
        name?: string;
        forceCategory?: string;
        onChange: (_value: string) => void;
    } & Partial<FieldSelectProperties>
> = ({ value, name, forceCategory, onChange, ...properties }) => {
    const { data: teams } = useTeams();

    const options = teams!.map((team) => {
        return {
            label: team.name,
            value: team.team_id,
        };
    });

    return (
        <FieldSelect
            {...properties}
            label={name}
            options={options}
            value={value ?? ''}
            justifyBetween
            onChange={(value) => {
                onChange(value);

                return true;
            }}
        />
    );
};
