import { sign } from 'jsonwebtoken';

import { DB } from '../database';
import { generateSnowflake } from '../routes/api';
import { GithubUser } from '../types/GithubUser.type';
import { Owner } from '../types/Owner.type';

export const getUserByGithub = (github_id: string) =>
    DB.selectOneFrom('owners', ['user_id'], { github_id });

export const createUserFromGithub = async (github_user: GithubUser) => {
    const user: Owner = {
        user_id: generateSnowflake(),
        github_id: github_user.id.toString(),
    };

    await DB.insertInto('owners', user);

    return user;
};

export const signToken = (user_id: string) =>
    sign(
        {
            user_id: user_id,
        },
        process.env.SIGNAL_MASTER
    );
