import { useOutletContext } from 'react-router';

import { ApplicationListData } from './useApps';

export const useApp = () => {
    const context = useOutletContext() as { app: ApplicationListData };

    return context.app;
};
