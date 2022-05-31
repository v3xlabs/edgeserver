import { FastifyPluginAsync } from 'fastify';
import { generateSunflake } from 'sunflake';

import { DB } from '../../../database';
import { useAuth } from '../../../util/http/useAuth';
import { log } from '../../../util/logging';
import { Poof } from '../../../util/sentry/sentryHandle';

export const generateSnowflake = generateSunflake();

export function determineIfAuth(
    toBeDetermined: Poof | string
): toBeDetermined is Poof {
    return !!toBeDetermined['status'];
}

export const DomainsEntryRoute: FastifyPluginAsync = async (
    router,
    _options
) => {
    router.get<{
        Params: {
            domain_id: string;
        };
    }>('/', async (_request, reply) => {
        const authData = (await useAuth(_request, reply)) as Poof | string;

        if (determineIfAuth(authData)) {
            reply.status(authData.status || 500);
            reply.send();
            log.ok(...authData.logMessages);

            return;
        }

        reply.send(
            await DB.selectFrom(
                'domains',
                '*',
                {
                    domain_id: _request.params.domain_id,
                },
                'LIMIT 50'
            )
        );
    });
};
