import { DeploymentData } from '@appTypes/DeploymentData';
import useSWR from 'swr';

export const useDeploys = (site: string) =>
    useSWR<DeploymentData[]>(`/s/${site}/deploys`);
