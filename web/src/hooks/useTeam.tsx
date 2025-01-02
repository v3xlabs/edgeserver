import { Team } from '@edgelabs/types';
import { useEffect } from 'react';
import useSWR from 'swr';
import create from 'zustand';

const useTeamStore = create<{
    activeTeam: string;
    setActiveTeam: (team: string) => void;
}>((set, get) => ({
    activeTeam: '123456789',
    setActiveTeam: (team) => set({ activeTeam: team }),
}));

export const useTeam = (team?: string) =>
    useSWR<Team>(() => team && `/t/${team}`);

export const useActiveTeam = () => {
    const { activeTeam, setActiveTeam } = useTeamStore();
    const { data, isLoading, mutate } = useTeam(activeTeam);

    useEffect(() => {
        if (activeTeam) {
            mutate();
        }
    }, [activeTeam]);

    return {
        team_id: activeTeam,
        team: data,
        setActiveTeam: (team: string) => {
            setActiveTeam(team);
        },
        isLoading,
        mutate,
    };
};
