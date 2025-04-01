import { queryOptions, useQuery } from '@tanstack/react-query';

import { apiRequest } from '../core';

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
