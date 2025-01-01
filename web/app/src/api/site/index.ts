import { queryOptions, useQuery } from "@tanstack/react-query";
import { apiRequest } from "../core";

export const getSites = () => queryOptions({
    queryKey: ['sites'],
    queryFn: async () => {
        const response = await apiRequest('/site', 'get', {});

        return response.data;
    }
});

export const useSites = () => {
    return useQuery(getSites());
};

export const getSite = (siteId: string) => queryOptions({
    queryKey: ['site', '{siteId}', siteId],
    queryFn: async () => {
        const response = await apiRequest(`/site/{site_id}`, 'get', {
            path: { site_id: siteId }
        });

        return response.data;
    }
});

export const useSite = (siteId: string) => {
    return useQuery(getSite(siteId));
};
