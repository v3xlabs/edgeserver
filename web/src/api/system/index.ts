import { queryOptions, useQuery } from '@tanstack/react-query';

import { apiRequest } from '../core';
import { components } from '../schema.gen';

export type IPFSStatus = components['schemas']['IPFSStatus'];

export const getIPFSStatus = () =>
    queryOptions({
        queryKey: ['system', 'ipfs'],
        queryFn: async () => {
            const response = await apiRequest('/system/ipfs', 'get', {});

            return response.data;
        },
    });

export const useIPFSStatus = () => {
    return useQuery(getIPFSStatus());
};

export const getBuildInfo = () =>
    queryOptions({
        queryKey: ['system', 'build'],
        queryFn: async () => {
            const response = await apiRequest('/system/build', 'get', {});

            return response.data;
        },
    });

export const useBuildInfo = () => {
    return useQuery(getBuildInfo());
};
