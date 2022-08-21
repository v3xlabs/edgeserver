import { environment } from '@utils/enviroment';

export const deleteAuthKey = async (key_id: string, token: string) => {
    return await fetch(environment.API_URL + '/api/keys', {
        method: 'DELETE',
        body: JSON.stringify({
            key_id,
        }),
        headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + token,
        },
    });
};

export const deleteSelfAuthKey = async (token: string) => {
    return await fetch(environment.API_URL + '/api/keys/self', {
        method: 'DELETE',
        body: JSON.stringify({}),
        headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + token,
        },
    });
};
