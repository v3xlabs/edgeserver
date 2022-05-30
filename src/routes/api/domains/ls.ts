import { FastifyPluginAsync } from 'fastify';
import { generateSunflake } from 'sunflake';

import { DB } from '../../../database';
import { useAuth } from '../../../util/http/useAuth';
import { Poof } from '../../../util/sentry/sentryHandle';

export const generateSnowflake = generateSunflake();

function determineIfAuth(
    toBeDetermined: Poof | string
): toBeDetermined is Poof {
    return !!toBeDetermined['status'];
}

export const DomainLsRoute: FastifyPluginAsync = async (router, options) => {
    router.get('/', async (_request, reply) => {
        const authData = (await useAuth(_request, reply)) as Poof | string;

        if (determineIfAuth(authData)) {
            return reply.status(authData.status).send();
        }

        reply.send(
            await DB.selectFrom('sites', '*', {
                owner: authData,
            })
        );
    });
};
