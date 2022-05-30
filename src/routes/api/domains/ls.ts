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

export const DomainsLsRoute: FastifyPluginAsync = async (router, _options) => {
    router.get('/', async (_request, reply) => {
        const authData = (await useAuth(_request, reply)) as Poof | string;

        if (determineIfAuth(authData)) {
            reply.status(authData.status || 500);
            reply.send();
            log.ok(...authData.logMessages);

            return;
        }

        reply.send(
            await DB.selectFrom('domains', '*', {
                user_id: authData,
            })
        );
    });
};
