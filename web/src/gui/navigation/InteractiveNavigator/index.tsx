import { useParams } from '@tanstack/react-router';
import { FC } from 'react';

import { SiteIndicator } from './SiteIndicator';
import { TeamIndicator } from './TeamIndicator';

export const InteractiveNavigator: FC = () => {
    const { siteId } = useParams({ strict: false });

    return (
        <div className="flex items-center gap-2">
            <TeamIndicator />
            {siteId && <div className="h-6 w-0.5 rotate-12 bg-black" />}
            <SiteIndicator />
        </div>
    );
};
