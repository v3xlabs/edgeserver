import { FastifyReply, FastifyRequest } from 'fastify';
import { decode } from 'jsonwebtoken';
import { object, string } from 'yup';

import { DB } from '../../database';
import { JWTAuthKey } from '../../types/AuthKey.type';
import { log } from '../logging';

const JWTAuthKeySchema = object().shape({
    key: string(),
    owner_id: string(),
    owner_address: string(),
    instance_id: string(),
    app_id: string().optional(),
});

export const useAPIToken: (
    request: FastifyRequest,
    reply: FastifyReply
) => Promise<Poof | string> = async (request, _reply) => {
    let auth = request.headers.authorization;

    if (!auth) {
        return {
            status: 401,
            logMessages: ['No Authorization header found'],
        };
    }

    if (auth.toLowerCase().startsWith('bearer ')) {
        auth = auth.slice('Bearer '.length);
    }

    const decoded = decode(auth) as JWTAuthKey;

    if (!decoded)
        return { status: 403, logMessages: ['Incorrect decoded payload'] };

    /* Yup validation here */
    const valid = JWTAuthKeySchema.isValidSync(decoded);

    if (!valid)
        return {
            status: 403,
            logMessages: ['Key "value" was missing from payload'],
        };

    // if (verify(auth, process.env.SIGNAL_MASTER)) return Malformat();

    const key = await DB.selectOneFrom('keys', ['owner_id'], {
        key: decoded.key.toString(),
        owner_id: decoded.owner_id,
    });

    console.log(decoded.owner_id, decoded.key.toString());

    if (!key) return { status: 403, logMessages: ['Not owner of Site'] };

    request.context['user'] = {
        user_id: key.owner_id,
    };

    log.network('Verified Auth for user ' + key.owner_id);

    return key.owner_id.toString();
};
