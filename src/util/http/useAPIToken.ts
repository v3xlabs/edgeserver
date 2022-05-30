import { FastifyReply, FastifyRequest } from 'fastify';
import { decode } from 'jsonwebtoken';

import { DB } from '../../database';
import { Owner } from '../../types/Owner.type';
import { log } from '../logging';
import { Poof } from '../sentry/sentryHandle';

type useAuthReturn =
    | {
          allowed: true;
          user: Owner;
      }
    | {
          allowed: false;
          reason: Poof;
      };

export const useAPIToken: (
    request: FastifyRequest,
    reply: FastifyReply
) => Promise<Poof | string> = async (request, _reply) => {
    let auth = request.headers.authorization;

    if (auth.toLowerCase().startsWith('bearer ')) {
        auth = auth.slice('Bearer '.length);
    }

    const decoded = decode(auth) as { account: string; value: number };

    if (!decoded)
        return { status: 403, logMessages: ['Incorrect decoded payload'] };

    if (!decoded['account'])
        return {
            status: 403,
            logMessages: ['Key "acount" was missing from payload'],
        };

    if (!decoded['value'])
        return {
            status: 403,
            logMessages: ['Key "value" was missing from payload'],
        };

    // if (verify(auth, process.env.SIGNAL_MASTER)) return Malformat();

    const key = await DB.selectOneFrom('keys', ['owner_id'], {
        key: decoded.value.toString(),
        owner_id: decoded.account,
    });

    console.log(decoded.account, decoded.value.toString());

    if (!key) return { status: 403, logMessages: ['Not owner of Site'] };

    request.context['user'] = {
        user_id: key.owner_id,
    };

    log.network('Verified Auth for user ' + key.owner_id);

    return key.owner_id.toString();
};
