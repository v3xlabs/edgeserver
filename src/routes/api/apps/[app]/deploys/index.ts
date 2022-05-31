import { FastifyPluginAsync } from 'fastify';
import { generateSunflake } from 'sunflake';

import { Auth } from '../../../../../middleware/auth';
import { DeploysEntryRoute } from './get';
import { DeploysLsRoute } from './ls';

export const generateSnowflake = generateSunflake();

export const AppDeploysRoute: FastifyPluginAsync = async (router, _options) => {
    router.register(Auth);

    router.get('/', (_request, reply) => {
        reply.send('stick');
    });

    router.register(DeploysLsRoute, { prefix: '/ls' });
    router.register(DeploysEntryRoute, { prefix: '/:deploy_id' });
};
