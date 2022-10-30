import { environment } from '@utils/enviroment';
import { useJWT } from '@utils/useAuth';
import { useQuery } from 'react-query';
// import { Domain } from '@edgelabs/types';

// TODO: Merge this w frontend type
type UnverifiedDomain = {
    type: 'ens' | 'dns' | '';
    name: string;
};

export const useUnverifiedDomains = () => {
    const { token } = useJWT();

    return useQuery<UnverifiedDomain[]>('/domains/uls', {
        queryFn: async () => {
            return await fetch(environment.API_URL + '/api/domains/uls', {
                method: 'GET',
                headers: { Authorization: 'Bearer ' + token },
            }).then((data) => data.json());
        },
    });
};
