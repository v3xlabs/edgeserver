import { environment } from '@utils/enviroment';
import { useJWT } from '@utils/useAuth';
import { useQuery } from 'react-query';
import { Domain } from '@edgelabs/types';

export const useDomains = () => {
    const { token } = useJWT();

    return useQuery<Domain[]>('/domains/ls', {
        queryFn: async () => {
            return await fetch(environment.API_URL + '/api/domains/ls', {
                method: 'GET',
                headers: { Authorization: 'Bearer ' + token },
            }).then((data) => data.json());
        },
    });
};
