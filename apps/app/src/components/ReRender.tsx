import { Button } from '@edgelabs/components';
import { useReRender } from '@utils/queries/useReRender';
import { FC } from 'react';

export const ReRender: FC<{ app_id: string }> = ({ app_id }) => {
    const { mutate, isLoading, isSuccess } = useReRender(app_id);

    return (
        <Button isDisabled={isSuccess || isLoading} onPress={() => mutate()}>
            {isSuccess
                ? 'Done'
                : isLoading
                ? 'Pending...'
                : 'Re-render last deployment'}
        </Button>
    );
};
