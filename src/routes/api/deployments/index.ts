import { FastifyPluginAsync } from 'fastify';
import { generateSunflake } from 'sunflake';

import { Auth } from '../../../middleware/auth';
import { DeploymentCreateRoute } from './create';
import { DeploymentLsRoute } from './ls';

export const generateSnowflake = generateSunflake();

export const DeploymentRoute: FastifyPluginAsync = async (router, options) => {
    router.register(Auth);

    router.get('/', (_request, reply) => {
        reply.send('stick');
    });

    router.register(DeploymentLsRoute, { prefix: '/ls' });
    router.register(DeploymentCreateRoute, { prefix: '/create' });
};
