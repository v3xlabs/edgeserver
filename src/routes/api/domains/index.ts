import { FastifyPluginAsync } from 'fastify';
import { generateSunflake } from 'sunflake';

import { Auth } from '../../../middleware/auth';
import { DeploymentCreateRoute } from './create';
import { DomainLsRoute } from './ls';

export const generateSnowflake = generateSunflake();

export const DomainRoute: FastifyPluginAsync = async (router, options) => {
    router.register(Auth);

    router.get('/', (_request, reply) => {
        reply.send('stick');
    });

    router.register(DomainLsRoute, { prefix: '/ls' });
    router.register(DeploymentCreateRoute, { prefix: '/create' });
};
