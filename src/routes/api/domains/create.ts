import { Static, Type } from '@sinclair/typebox';
import { FastifyPluginAsync } from 'fastify';

import { DB } from '../../../database';
import { DomainV1 } from '../../../types/Domain.type';
import { useAuth } from '../../../util/http/useAuth';
import { log } from '../../../util/logging';
import { Poof } from '../../../util/sentry/sentryHandle';
import { generateSnowflake } from '.';
import { determineIfAuth } from './ls';

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
            const authData = (await useAuth(_request, reply)) as Poof | string;

            if (determineIfAuth(authData)) {
                reply.status(authData.status || 500);
                reply.send();
                log.ok(...authData.logMessages);

                return;
            }

            const { host } = _request.body;
            const domain_id = generateSnowflake();

            const domain: Partial<DomainV1> = {
                domain_id,
                domain: host,
                user_id: authData,
            };

            await DB.insertInto('domains', domain);

            reply.send({ domain_id });
        }
    );
};
