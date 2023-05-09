import { Token } from '@edgelabs/types';
import useSWR from 'swr';

export const useTeamTokens = (team: string) =>
    useSWR<Token[]>(`/t/${team}/tokens`);

export const useSiteTokens = (site: string) =>
    useSWR<Token[]>(`/s/${site}/tokens`);
