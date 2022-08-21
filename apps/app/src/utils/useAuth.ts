import { useEffect, useState } from 'react';
import { useQuery } from 'react-query';
import { useAccount } from 'wagmi';
import create from 'zustand';
import { persist } from 'zustand/middleware';

import { environment } from './enviroment';
import { deleteSelfAuthKey } from './queries/deleteAuthKey';
import { UnauthorizedError } from './UnauthorizedError';

type JWTData = {
    token: string;
};

export const useJWT = create(
    persist<
        JWTData & { setToken: (_token: string) => void; resetToken: () => void }
    >(
        (set) => ({
            token: '',
            setToken: (token) => set((_state) => ({ token })),
            resetToken: () =>
                set((_state) => {
                    try {
                        deleteSelfAuthKey(_state.token);
                    } catch {
                        console.log('failed to delete own auth key, skip');
                    }

                    return { token: '' };
                }),
        }),
        { name: 'SIGNAL-token' }
    )
);

export const useWhitelist = (address: string) => {
    const [whitelisted, setWhitelisted] = useState(true);

    useEffect(() => {
        if (!address) {
            setWhitelisted(false);

            return;
        }

        (async () => {
            // Insert code to actually fetch whitelisted status here

            const response = await fetch(
                environment.API_URL +
                    '/api/login/whitelist/' +
                    address.toLowerCase()
            );

            const body = await response.json();

            setWhitelisted(!!body['exists']);
        })();
    }, [address]);

    return whitelisted;
};

export const useSetupCheck = () =>
    useQuery('/admin/setup/check', async () => {
        const userDataRequest = await fetch(
            environment.API_URL + '/api/admin/setup/check',
            {
                method: 'GET',
            }
        );

        if (userDataRequest.status != 200) return;

        return (await userDataRequest.json()) as { configured: boolean };
    });

export const useAuth = () => {
    const token = useJWT((state) => state.token);
    const { data, isLoading, isSuccess } = useAccount();
    const whitelisted = useWhitelist(data?.address || '');

    const { data: userData, error } = useQuery<{ admin: boolean }>(
        '/user/' + data?.address,
        async () => {
            const userDataRequest = await fetch(
                environment.API_URL + '/api/me',
                {
                    method: 'GET',
                    headers: { Authorization: 'Bearer ' + token },
                }
            );

            if (userDataRequest.status == 403) throw new UnauthorizedError();

            if (userDataRequest.status != 200)
                throw new Error('Status Code ' + userDataRequest.status);

            return await userDataRequest.json();
        }
    );

    const { data: configured } = useSetupCheck();

    if (!data?.address) return { state: 'no-wallet' };

    if (isLoading && token) return { state: 'loading-alt' };

    if (isLoading) return { state: 'loading' };

    if (!data || !isSuccess) return { state: 'no-wallet' };

    if (configured?.configured === false)
        return { state: 'not-setup', address: data.address };

    if (!whitelisted)
        return { state: 'not-whitelisted', address: data.address };

    if (!token || error) return { state: 'no-token', address: data.address };

    return { state: 'authenticated', address: data.address, userData };
};
