import { useActiveSite } from './useSite';
import { useActiveTeam } from './useTeam';

type ActiveFocus = {
    state: 'none' | 'team' | 'site';
    state_id?: string;
};

export const useActiveFocus = (): ActiveFocus => {
    const { team_id } = useActiveTeam();
    const { activeSite } = useActiveSite();

    if (team_id && activeSite) {
        return {
            state: 'site',
            state_id: activeSite,
        };
    }

    if (team_id) {
        return {
            state: 'team',
            state_id: team_id,
        };
    }

    return {
        state: 'none',
    };
};
