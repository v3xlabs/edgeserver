import { Domain } from '@edgelabs/types';
import useSWR from 'swr';

export const useDomains = (site: string) =>
    useSWR<Domain[]>(`/s/${site}/domains`);
