import { FastifyPluginAsync } from 'fastify';

import { log } from '../utils/logger.js';
import { authRoute } from './auth.js';
import { SiteRoute } from './site/index.js';
import { SiweRoute } from './siwe/index.js';
import { AllTeamRoute } from './team/all.js';
import { TeamRoute } from './team/index.js';

export const ApiRoute: FastifyPluginAsync<{}> = async (router) => {
    router.get('/', async (request, reply) => {
        log.info('Hello World');

        return reply.send({
            message: 'Edgeserver API',
            timestamp: Date.now(),
        });
    });

    router.register(SiweRoute, { prefix: '/siwe' });
    router.register(ProtectedRouter, { prefix: '/' });
};

const ProtectedRouter: FastifyPluginAsync<{}> = async (router) => {
    router.addHook('onRequest', authRoute);

    router.register(AllTeamRoute, { prefix: '/t' });
    router.register(TeamRoute, { prefix: '/t/:team_id' });
    router.register(SiteRoute, { prefix: '/s/:site_id' });
};
