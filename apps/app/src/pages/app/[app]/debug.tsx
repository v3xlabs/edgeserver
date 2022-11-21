import { ReRender } from '@components/ReRender';
import { useApp } from '@utils/queries/useApp';
import { FC } from 'react';

import { AppLayout } from './Layout';

export const AppDebugPage: FC = () => {
    const app = useApp();

    return (
        <AppLayout page="debug">
            Please ignore the following debug information <br />
            App ID: {app.app_id}
            <br />
            Owner: {app.owner_id}
            <br />
            Domain: {app.domain_id}
            <br />
            <div>
                <ReRender app_id={app.app_id} />
            </div>
        </AppLayout>
    );
};
