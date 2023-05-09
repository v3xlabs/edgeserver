import { Site } from '@edgelabs/types';
import useSWR from 'swr';

export const useSites = (team: string) => useSWR<Site[]>(`/t/${team}/sites`);
