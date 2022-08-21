import { environment } from '@utils/enviroment';
import { useJWT } from '@utils/useAuth';
import { useMutation } from 'react-query';

export const useReRender = (app_id: string | undefined) => {
    const { token } = useJWT();

    return useMutation(`/app/${app_id}/render`, {
        mutationFn: async () => {
            if (!app_id) return;

            return await fetch(
                environment.API_URL + '/api/apps/' + app_id + '/render',
                {
                    method: 'GET',
                    headers: { Authorization: 'Bearer ' + token },
                }
            );
        },
    });
};
