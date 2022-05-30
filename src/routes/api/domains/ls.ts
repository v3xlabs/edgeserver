import { FastifyPluginAsync } from 'fastify';
import { generateSunflake } from 'sunflake';

import { DB } from '../../../database';
import { useAuth } from '../../../util/http/useAuth';
import { log } from '../../../util/logging';
import { Poof } from '../../../util/sentry/sentryHandle';

export const generateSnowflake = generateSunflake();

function determineIfAuth(
    toBeDetermined: Poof | string
): toBeDetermined is Poof {
    return !!toBeDetermined['status'];
}

export const DomainLsRoute: FastifyPluginAsync = async (router, options) => {
    router.get('/', async (_request, reply) => {
<<<<<<< HEAD
        reply.send(await DB.selectFrom('sites', '*', {}));
=======
        const authData = (await useAuth(_request, reply)) as Poof | string;

        if (determineIfAuth(authData)) {
            reply.status(authData.status || 500);
            reply.send();
            log.ok(...authData.logMessages);

            return;
        }

        reply.send(
            await DB.selectFrom('sites', '*', {
                owner: authData,
            })
        );
>>>>>>> 3109f3e01b5adcfcd2ef27acdcc5ad9c33742ed0
    });
};
