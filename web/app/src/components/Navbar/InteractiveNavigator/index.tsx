import { FC } from 'react';
import { useActiveSite } from 'src/hooks/useSite';
import { useActiveTeam } from 'src/hooks/useTeam';

import { SiteIndicator } from './SiteIndicator';
import { TeamIndicator } from './TeamIndicator';

export const InteractiveNavigator: FC = () => {
    const { team } = useActiveTeam();
    const { activeSite } = useActiveSite();

    return (
        <div className="flex items-center gap-2">
            <TeamIndicator />
            {team && activeSite && (
                <div className="h-6 w-0.5 rotate-12 bg-black" />
            )}
            <SiteIndicator />
        </div>
    );
};
