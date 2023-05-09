import { Site } from '@edgelabs/types';
import useSWR from 'swr';
import create from 'zustand';

export const useSite = (site?: string) =>
    useSWR<Site>(() => site && `/s/${site}`);

export const useActiveSite = create<{
    activeSite: string;
    setActiveSite: (site: string) => void;
}>((set) => ({
    activeSite: '',
    setActiveSite: (site) => set({ activeSite: site }),
}));
