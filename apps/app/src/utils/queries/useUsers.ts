import { environment } from '@utils/enviroment';
import { useJWT } from '@utils/useAuth';
import { useQuery } from 'react-query';

export type User = {
    user_id: string;
    address: string;
    admin: boolean;
};

export const useUsers = () => {
    const { token } = useJWT();

    return useQuery<User[]>('/users/', {
        queryFn: async () => {
            return await fetch(environment.API_URL + '/api/admin/users/ls', {
                method: 'GET',
                headers: { Authorization: 'Bearer ' + token },
            }).then((data) => data.json());
        },
    });
};
