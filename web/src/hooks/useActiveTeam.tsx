import { createStore } from '@xstate/store';
import { useSelector } from '@xstate/store/react';

import { useTeams } from '@/api';

const loadInitial = () => {
    const team = localStorage.getItem('@edgeserver/team');

    return team ? (JSON.parse(team) as { team_id: string }) : { team_id: '' };
};

export const teamStore = createStore({
    context: loadInitial(),
    on: {
        selectTeam: (context, event: { team_id: string }) => ({
            team_id: event.team_id,
        }),
    },
});

export const useActiveTeam = () => {
    const team_id = useSelector(teamStore, (state) => state.context.team_id);
    const { data: teams } = useTeams();

    return team_id || teams?.[0]?.team_id;
};
