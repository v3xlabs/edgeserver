import { environment } from '@utils/enviroment';
import { useJWT } from '@utils/useAuth';
import { useQuery } from 'react-query';
import { Application } from 'src/types/Application';

export const useAppByID = (app_id: string | undefined) => {
    const { token } = useJWT();
    const query = useQuery('/app/' + app_id, {
        queryFn: async () => {
            if (!app_id) return;

            return (await fetch(environment.API_URL + '/api/apps/' + app_id, {
                method: 'GET',
                headers: { Authorization: 'Bearer ' + token },
            }).then((data) => data.json())) as Application;
        },
    });

    if (app_id == 'null') return;

    return query;
};
