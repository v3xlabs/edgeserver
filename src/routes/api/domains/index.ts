import { FastifyPluginAsync } from 'fastify';
import { generateSunflake } from 'sunflake';

import { Auth } from '../../../middleware/auth';
import { DomainCreateRoute } from './create';
import { DomainsLsRoute } from './ls';

export const generateSnowflake = generateSunflake();

export const DomainRoute: FastifyPluginAsync = async (router, _options) => {
    router.register(Auth);

    router.get('/', (_request, reply) => {
        reply.send('stick');
    });

    router.register(DomainsLsRoute, { prefix: '/ls' });
    router.register(DomainCreateRoute, { prefix: '/create' });
};
