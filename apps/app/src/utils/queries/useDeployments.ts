import { environment } from '@utils/enviroment';
import { useJWT } from '@utils/useAuth';
import { useEffect, useReducer } from 'react';
import { useMutation, useQuery } from 'react-query';
import { Deployment } from 'src/types/Deployment';

export const useDeployments = (
    app_id: string | undefined,
    paging_limit: number
) => {
    const { token } = useJWT();
    const [deployments, addDeployments] = useReducer(
        (previous: Deployment[], nw: Deployment[]) => {
            const used: string[] = [];

            // Uniqueness Verification incase of network bugs or caching
            return [...previous, ...nw].filter((steve) => {
                if (used.includes(steve.deploy_id)) return false;

                used.push(steve.deploy_id);

                return true;
            });
        },
        []
    );

    const totalQuery = useQuery(`/app/${app_id}/deploys/total`, {
        queryFn: async () => {
            if (!app_id) return;

            return await fetch(
                environment.API_URL + '/api/apps/' + app_id + '/deploys/total',
                {
                    method: 'GET',
                    headers: { Authorization: 'Bearer ' + token },
                }
            ).then((data) => data.json());
        },
    });

    const { data, mutate, isLoading, error } = useMutation<Deployment[]>(
        `/app/${app_id}/deploys/ls`,
        {
            mutationFn: async () => {
                if (!app_id) return;

                const from = deployments.at(-1);

                return await fetch(
                    environment.API_URL +
                        '/api/apps/' +
                        app_id +
                        '/deploys/ls?' +
                        (from ? 'offset=' + from.deploy_id + '&' : '') +
                        'limit=' +
                        paging_limit,
                    {
                        method: 'GET',
                        headers: { Authorization: 'Bearer ' + token },
                    }
                ).then((data) => data.json());
            },
        }
    );

    useEffect(() => {
        if (data) {
            addDeployments(data);
        } else {
            mutate();
        }
    }, [data]);

    return {
        loading:
            totalQuery.isLoading || (isLoading && deployments.length === 0),
        loadingMore: isLoading && deployments.length > 0,
        error: totalQuery.error || error,
        total: totalQuery.data || undefined,
        deployments,
        fetchMoar: mutate,
    };
};
