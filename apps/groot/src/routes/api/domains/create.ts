import { Static, Type } from '@sinclair/typebox';
import { FastifyPluginAsync } from 'fastify';

import { CACHE } from '../../../cache';
import { DB } from '../../../database';
import { SafeError } from '../../../util/error/SafeError';
import { useAuth } from '../../../util/http/useAuth';
import { KeyPerms, usePerms } from '../../../util/permissions';

export const DomainCreateRoute: FastifyPluginAsync = async (
    router,
    _options
) => {
    const createPayload = Type.Object({
        host: Type.String(),
    });

    router.post<{
        Body: Static<typeof createPayload>;
    }>(
        '/',
        {
            schema: {
                body: createPayload,
            },
        },
        async (_request, reply) => {
            const { user_id, permissions } = await useAuth(_request, reply);

            usePerms(permissions, [KeyPerms.DOMAINS_WRITE]);

            const { host } = _request.body;

            const old_domain = await DB.selectOneFrom('domains', ['domain'], {
                domain: host,
            });

            if (old_domain)
                throw new SafeError(409, '', 'domain-create-exists');

            const user = await DB.selectOneFrom('owners', ['address'], { user_id });

            if (!user)
                throw new SafeError(409, '', 'domain-create-user-not-exist');

            await CACHE.SADD('dns:domains:' + host, user.address);
            await CACHE.SADD('dns:users:' + user.address, host);
            await CACHE.LPUSH('dns:iqueue', host);

            reply.send({ status: 'OK' })
        }
    );
};
