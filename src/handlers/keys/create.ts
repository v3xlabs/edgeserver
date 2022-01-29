import { types } from 'cassandra-driver';
import { RequestHandler } from 'express';
import { UseYupRequest } from 'use-yup';

import { createKey } from '../../auth/createKey';
import { DB } from '../../Data';
import { log } from '../../util/logging';
import { CreateQuery } from './';

export const GET: RequestHandler = async (
    request: UseYupRequest<typeof CreateQuery>,
    response
) => {
    log.debug(request.yupData);
    // Verify the user exists
    const user = await DB.selectOneFrom('owners', ['user_id'], {
        user_id: BigInt(request.yupData.account),
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
        owner_id: user.user_id,
    });

    // Send key back to user
    response.send(key.key);
};
