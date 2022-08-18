import { FastifyPluginAsync } from 'fastify';
import { generateSunflake } from 'sunflake';

import { DeploysEntryRoute } from './[deploy]';
import { DeploysLsRoute } from './ls';
import { DeploysTotalRoute } from './total';

export const generateSnowflake = generateSunflake();

export const AppDeploysRoute: FastifyPluginAsync = async (router, _options) => {
    router.get('/', (_request, reply) => {
        reply.send('stick');
    });

    router.register(DeploysLsRoute, { prefix: '/ls' });
    router.register(DeploysTotalRoute, { prefix: '/total' });
    router.register(DeploysEntryRoute, { prefix: '/:deploy_id' });
};
