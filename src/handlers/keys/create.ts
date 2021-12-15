import { RequestHandler } from 'express';
import { createKey } from '../../auth/createKey';
import { UseYupRequest } from 'use-yup';
import { CreateQuery } from './';
import { log } from '../../util/logging';
import { DB } from '../../Data';
import { types } from 'cassandra-driver';

export const GET: RequestHandler = async (
    request: UseYupRequest<typeof CreateQuery>,
    response
) => {
    log.debug(request.yupData);
    // Verify the user exists
    const user = await DB.selectOneFrom('owners', ['user_id'], {
        user_id: types.Long.fromNumber(request.yupData.account),
    });
    if (!user) {
        response.status(400).send('User does not exist');
        return;
    }

    // Create a key
    const key = await createKey(request.yupData.account.toString());

    log.database(user.user_id);

    // Push key to DB
    DB.insertInto('keys', {
        key: key.random.toString(),
        owner_id: types.Long.fromNumber(user.user_id.toNumber()),
    });

    // Send key back to user
    response.send(key.key);
};
