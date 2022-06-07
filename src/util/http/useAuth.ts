import { FastifyReply, FastifyRequest } from 'fastify';
import { decode, verify } from 'jsonwebtoken';

import { DB } from '../../database';
import { OwnerV1 } from '../../types/Owner.type';
import { log } from '../logging';
import { Poof } from '../sentry/sentryHandle';

type useAuthReturn =
    | {
          allowed: true;
          user: OwnerV1;
      }
    | {
          allowed: false;
          reason: Poof;
      };

export const useAuth: (
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

    console.log(auth);

    const decoded = decode(auth) as { address: string; user_id: string };

    if (!decoded)
        return { status: 403, logMessages: ['Incorrect decoded payload'] };

    if (!decoded.address)
        return {
            status: 403,
            logMessages: ['Key "account" was missing from payload'],
        };

    if (!decoded.user_id)
        return {
            status: 403,
            logMessages: ['Key "user_id" was missing from payload'],
        };

    try {
        verify(auth, process.env.SIGNAL_MASTER ?? '');
    } catch {
        return {
            status: 403,
            logMessages: ['Invalid signature on payload'],
        };
    }

    const owner = await DB.selectOneFrom('owners', ['user_id'], {
        address: decoded.address,
        user_id: decoded.user_id,
    });

    if (!owner) return { status: 403, logMessages: ['Not valid user'] };

    request.context['user'] = {
        user_id: owner.user_id,
    };

    log.network('Verified Auth for user ' + owner.user_id);

    return owner.user_id;
};
