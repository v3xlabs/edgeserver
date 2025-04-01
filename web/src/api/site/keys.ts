import { queryOptions, useMutation, useQuery } from '@tanstack/react-query';

import { queryClient } from '@/util/query';

import { apiRequest } from '../core';
import { components } from '../schema.gen';

export type SiteKey = components['schemas']['Key'];
export type NewSiteKey = components['schemas']['NewKey'];

export const getSiteKeys = (siteId: string) =>
    queryOptions({
        queryKey: ['auth', 'site', '{siteId}', siteId, 'keys'],
        queryFn: async () => {
            const response = await apiRequest('/site/{site_id}/keys', 'get', {
                path: {
                    site_id: siteId,
                },
            });

            return response.data;
        },
    });

export const useSiteKeys = (siteId: string) => {
    return useQuery(getSiteKeys(siteId));
};

export const useSiteKeyCreate = () =>
    useMutation({
        mutationFn: async ({
            siteId,
            permissions,
        }: {
            siteId: string;
            permissions: string;
        }) => {
            const response = await apiRequest('/site/{site_id}/keys', 'post', {
                path: { site_id: siteId },
                data: { permissions },
                contentType: 'application/json; charset=utf-8',
            });

            queryClient.invalidateQueries({
                queryKey: ['auth', 'site', '{siteId}', siteId, 'keys'],
            });

            return response.data;
        },
    });

export const useSiteKeyDelete = () =>
    useMutation({
        mutationFn: async ({
            siteId,
            keyId,
        }: {
            siteId: string;
            keyId: string;
        }) => {
            const response = await apiRequest(
                '/site/{site_id}/keys/{key_id}',
                'delete',
                {
                    path: { site_id: siteId, key_id: keyId },
                }
            );

            queryClient.invalidateQueries({
                queryKey: ['auth', 'site', '{siteId}', siteId, 'keys'],
            });

            return response.data;
        },
    });
