import axios from 'axios';
import BuildUrl from 'build-url';

import { GithubUser } from '../types/GithubUser.type';

export const getAccessToken = async (code: string) => {
    const response = await axios.post<{
        access_token: string;
        scope: string;
        token_type: 'bearer';
    }>(
        BuildUrl('https://github.com/login/oauth/access_token', {
            queryParams: {
                client_id: process.env.GITHUB_ID,
                client_secret: process.env.GITHUB_SECRET,
                code: code,
            },
        }),
        undefined,
        {
            headers: { Accept: 'application/json' },
        }
    );

    return response.data.access_token;
};

export const getUserData = async (access_token: string) => {
    const response = await axios.get<GithubUser>(
        BuildUrl('https://api.github.com/user'),
        {
            headers: {
                Authorization: 'token ' + access_token,
            },
        }
    );

    return await response.data;
};
