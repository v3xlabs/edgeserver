import { JWTAuthKey } from '@edgelabs/types';
import { sign } from 'jsonwebtoken';
import ms from 'ms';

import { Globals } from '../..';
import { log } from '../../util/logging';
import { createExpiringAuthKey, createLongLivedAuthKey } from './keys';

export const createLongLivedAuthToken = async (
    user_id: bigint,
    permissions: bigint,
    name: string
) => {
    const key = await createLongLivedAuthKey(user_id, permissions, name);

    const payload: JWTAuthKey = {
        instance_id: Globals.INSTANCE_ID,
        key: key.key.toString(),
        owner_id: user_id.toString(),
    };

    return sign(payload, process.env.SIGNAL_MASTER ?? '');
};

export const createExpiringAuthToken = async (
    user_id: bigint,
    permissions: bigint,
    name: string,
    last_use_data: string,
    expiresIn: string = '10h'
) => {
    const expiresAt = Date.now() + ms(expiresIn);

    const key = await createExpiringAuthKey(
        user_id,
        permissions,
        name,
        last_use_data,
        expiresAt
    );

    const payload: JWTAuthKey = {
        instance_id: Globals.INSTANCE_ID,
        key: key.key.toString(),
        owner_id: user_id.toString(),
    };

    log.debug('vals', expiresIn, payload, key);

    return sign(payload, process.env.SIGNAL_MASTER ?? '', { expiresIn });
};
