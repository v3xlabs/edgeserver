import { OwnerV1 } from '@edgelabs/types';

import { CACHE } from '../cache';
import { DB } from '../database';
import { generateSnowflake } from '../routes/api';
import { log } from '../util/logging';

export const getUserBy = (address: string) =>
    DB.selectOneFrom('owners', ['user_id'], { address });

export const createUserFromAddress = async (address: string) => {
    const user: OwnerV1 = {
        user_id: generateSnowflake(),
        address,
    };

    await DB.insertInto('owners', user);

    return user;
};

export const getLoginSessionByState = async (state: string) => {
    const session = await CACHE.get('sedge-auth-' + state);

    log.debug('finding ' + state, session);

    return session;
};

export const setPSKfromState = async (code: string, psk: string) => {
    await CACHE.set('sedge-auth-' + code, psk, { EX: 60 * 5 });
};
