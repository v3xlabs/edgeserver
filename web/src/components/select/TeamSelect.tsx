import { FC } from 'react';

import { Input } from '../input';

export const TeamSelect: FC<{ value?: string }> = ({ value }) => {
    return <Input value={value} />;
};
