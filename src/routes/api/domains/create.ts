import { Static, Type } from '@sinclair/typebox';
import { FastifyPluginAsync } from 'fastify';

import { DB } from '../../../database';
import { DomainV1 } from '../../../types/Domain.type';
import { useAuth } from '../../../util/http/useAuth';
import { log } from '../../../util/logging';
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
            const { user_id } = await useAuth(_request, reply);

            const { host } = _request.body;

            const old_domain = await DB.selectOneFrom('domains', ['domain'], {
                domain: host,
            });

            if (old_domain) {
                reply.status(409);
                reply.send();
            }

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
