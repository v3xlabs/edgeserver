import { NoDeployments } from '@components/NoDeployments/NoDeployments';
import { useApp } from '@utils/queries/useApp';
import { FC } from 'react';

import { AppLayout } from './Layout';

export const AppSetupPage: FC = () => {
    const app = useApp();

    return (
        <AppLayout page="/">
            <NoDeployments app_id={app.app_id} />
        </AppLayout>
    );
};
