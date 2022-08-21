import { useReRender } from '@utils/queries/useReRender';
import { FC } from 'react';

import { Button } from './Button';

export const ReRender: FC<{ app_id: string }> = ({ app_id }) => {
    const { mutate, isLoading, isSuccess } = useReRender(app_id);

    return (
        <Button
            label={
                isSuccess
                    ? 'Done'
                    : isLoading
                    ? 'Pending...'
                    : 'Re-render last deployment'
            }
            disabled={isSuccess || isLoading}
            onClick={() => mutate()}
        />
    );
};
