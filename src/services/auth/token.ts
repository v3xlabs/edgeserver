import { sign } from 'jsonwebtoken';
import ms from 'ms';

import { Globals } from '../..';
import { JWTAuthKey } from '../../types/AuthKey.type';
import { log } from '../../util/logging';
import { createExpiringAuthKey, createLongLivedAuthKey } from './keys';
import { PermissionsString } from './permissions';

export const createLongLivedAuthToken = async (
    user_id: string,
    permissions: PermissionsString
) => {
    const key = await createLongLivedAuthKey(user_id, permissions);

    const payload: JWTAuthKey = {
        instance_id: Globals.INSTANCE_ID,
        key: key.key,
        owner_id: user_id,
    };

    return sign(payload, process.env.SIGNAL_MASTER ?? '');
};

export const createExpiringAuthToken = async (
    user_id: string,
    permissions: PermissionsString,
    expiresIn: string = '10h'
) => {
    const expiresAt = Date.now() + ms(expiresIn);

    const key = await createExpiringAuthKey(user_id, permissions, expiresAt);

    const payload: JWTAuthKey = {
        instance_id: Globals.INSTANCE_ID,
        key: key.key,
        owner_id: user_id,
    };

    log.debug('vals', expiresIn, payload, key);

    return sign(payload, process.env.SIGNAL_MASTER ?? '', { expiresIn });
};
