import { sign } from 'jsonwebtoken';

import { CACHE } from '../cache';
import { DB } from '../database';
import { generateSnowflake } from '../routes/api';
import { Owner } from '../types/Owner.type';
import { log } from '../util/logging';

export const getUserBy = (address: string) =>
    DB.selectOneFrom('owners', ['user_id'], { address });

export const createUserFromAddress = async (address: string) => {
    const user: Owner = {
        user_id: generateSnowflake(),
        address,
    };

    await DB.insertInto('owners', user);

    return user;
};

export const signToken = (user_id: string, address: string) => {
    const payload = {
        address: address,
        user_id: user_id,
    };

    return sign(payload, process.env.SIGNAL_MASTER);
};

export const getLoginSessionByState = async (state: string) => {
    const session = await CACHE.get('sedge-auth-' + state);

    log.debug('finding ' + state, session);

    return session;
};

export const setPSKfromState = async (code: string, psk: string) => {
    await CACHE.set('sedge-auth-' + code, psk, { EX: 60 * 5 });
};
