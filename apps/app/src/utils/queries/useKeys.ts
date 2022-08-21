import { environment } from '@utils/enviroment';
import { useJWT } from '@utils/useAuth';
import { useQuery } from 'react-query';
import { AuthKey } from 'src/types/AuthKey';

export const useKeys = () => {
    const { token } = useJWT();

    return useQuery<{ keys: AuthKey[] }>('/keys/', {
        queryFn: async () => {
            return await fetch(environment.API_URL + '/api/keys', {
                method: 'GET',
                headers: { Authorization: 'Bearer ' + token },
            }).then((data) => data.json());
        },
    });
};
