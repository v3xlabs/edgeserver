import { useMutation, useQuery } from '@tanstack/react-query';

import { queryClient } from '@/util/query';

export const useKeys = ({ siteId }: { siteId?: string }) => {
    return useQuery({
        queryKey: ['tokens', siteId || 'global'],
        queryFn: async () => {
            return Array.from({ length: 10 }, () => ({
                token: '*******' + Math.random().toString(16).slice(2, 8),
                createdBy: 'nobody',
                lastUsed: new Date(),
                siteId: '',
            }));
        },
    });
};

export const useKeyCreate = () =>
    useMutation({
        mutationKey: ['tokensUpdate', 'global'],
        mutationFn: async ({
            name,
            siteId,
        }: {
            name: string;
            siteId?: string;
        }) => {
            queryClient.setQueryData(
                ['tokens', 'global'],
                (
                    old:
                        | {
                              token: string;
                              createdBy: string;
                              lastUsed?: Date;
                              siteId?: string;
                          }[]
                        | undefined
                ) => [
                    {
                        token: Math.random()
                            .toString(16)
                            .slice(2, 20)
                            .padEnd(13, '0'),
                        createdBy: name,
                        lastUsed: undefined,
                        siteId,
                    },
                    ...(old || []),
                ]
            );

            return 'Hi';
        },
    });
