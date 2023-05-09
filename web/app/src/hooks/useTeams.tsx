import { Team } from '@edgelabs/types';
import useSWR from 'swr';

export const useTeams = () => useSWR<Team[]>('/t');
