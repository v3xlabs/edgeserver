import { FC } from 'react';

import { useUsers } from '@/api';

import {
    FieldSelect,
    FieldSelectProperties as FieldSelectProperties,
} from '../select/FieldSelect';

export const UserSelect: FC<
    {
        value: string;
        name?: string;
        forceCategory?: string;
        onChange: (_value: string) => void;
    } & Partial<FieldSelectProperties>
> = ({ value, name, forceCategory, onChange, ...properties }) => {
    const { data: users } = useUsers();

    const options = (users || []).map((user) => {
        return {
            label: user.name,
            value: user.user_id,
        };
    });

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
