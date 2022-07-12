import { Static, Type } from '@sinclair/typebox';
import { FastifyPluginAsync } from 'fastify';

import { DB } from '../../../database';
import { DomainV1 } from '../../../types/Domain.type';
import { SafeError } from '../../../util/error/SafeError';
import { useAuth } from '../../../util/http/useAuth';
import { KeyPerms, usePerms } from '../../../util/permissions';
import { generateSnowflake } from '.';

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

            const domain_id = generateSnowflake();

            const domain: Partial<DomainV1> = {
                domain_id,
                domain: host,
                user_id,
            };

            await DB.insertInto('domains', domain);

            reply.send({ domain_id });
        }
    );
};
