import { FastifyReply, FastifyRequest } from 'fastify';
import { decode } from 'jsonwebtoken';
import { object, string } from 'yup';

import { getAuthKey, updateExpiringLastUsed, updateLongLivedLastUsed } from '../../services/auth/keys';
import { JWTAuthKey } from '../../types/AuthKey.type';
import { SafeError } from '../error/SafeError';
import { log } from '../logging';

const JWTAuthKeySchema = object().shape({
    key: string().required(),
    owner_id: string().required(),
    instance_id: string().required(),
    app_id: string().optional(),
});

export type AuthData = { user_id: string; key_id: string };

export const useAuth: (
    request: FastifyRequest,
    reply: FastifyReply
) => Promise<AuthData> = async (request, _reply) => {
    let auth = request.headers.authorization;

    if (!auth) throw new SafeError(401, '', 'auth-no-header');

    if (auth.toLowerCase().startsWith('bearer ')) {
        auth = auth.slice('Bearer '.length);
    }

    const decoded = decode(auth) as JWTAuthKey;

    if (!decoded) throw new SafeError(403, '', 'auth-invalid-jwt-payload');

    /* Yup validation here */
    const valid = JWTAuthKeySchema.isValidSync(decoded);

    if (!valid) throw new SafeError(403, '', 'auth-invalid-yup-payload');

    // if (verify(auth, process.env.SIGNAL_MASTER)) return Malformat();

    const key = await getAuthKey(decoded.key.toString(), decoded.owner_id);

    if (!key) throw new SafeError(403, '', 'auth-no-key-found');

    request.context['user'] = {
        user_id: key.owner_id,
    };

    log.network('Verified Auth for user ' + key.owner_id);

    {
        if (key['exp']) {
            updateExpiringLastUsed(key.key, key.owner_id);
        } else {
            updateLongLivedLastUsed(key.key);
        }
    }

    return { user_id: key.owner_id.toString(), key_id: key.key };
};
