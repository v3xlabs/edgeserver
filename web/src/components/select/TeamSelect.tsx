import { FC } from 'react';

import { Input } from '../input';

export const TeamSelect: FC<{
    value?: string;
    id?: string;
    onChange?: (value: string) => void;
    onBlur?: () => void;
}> = ({ value, id, onChange, onBlur }) => {
    return (
        <Input
            id={id}
            value={value}
            onChange={(event) => onChange?.(event.target.value)}
            onBlur={onBlur}
        />
    );
};
