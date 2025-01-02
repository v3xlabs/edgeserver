import { FC } from 'react';

import { useActiveTeam } from '@/hooks/useActiveTeam';

import { SiteIndicator } from './SiteIndicator';
import { TeamIndicator } from './TeamIndicator';

export const InteractiveNavigator: FC = () => {
    // const { team } = useActiveTeam();
    // const { activeSite } = useActiveSite();
    const team_id = useActiveTeam();
    const activeSite = '1';

    return (
        <div className="flex items-center gap-2">
            <TeamIndicator />
            {team_id && activeSite && (
                <div className="h-6 w-0.5 rotate-12 bg-black" />
            )}
            <SiteIndicator />
        </div>
    );
};
