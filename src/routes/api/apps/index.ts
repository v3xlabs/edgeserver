import { FastifyPluginAsync } from 'fastify';
import { generateSunflake } from 'sunflake';

import { Auth } from '../../../middleware/auth';
import { AppEntryRoute } from './[app]';
import { AppCreateRoute } from './create';
import { AppLsRoute } from './ls';

export const generateSnowflake = generateSunflake();

export const AppRoute: FastifyPluginAsync = async (router, _options) => {
    router.register(Auth);

    router.get('/', (_request, reply) => {
        reply.send('stick');
    });

    router.register(AppLsRoute, { prefix: '/ls' });
    router.register(AppCreateRoute, { prefix: '/create' });
    router.register(AppEntryRoute, {
        prefix: '/:app_id',
    });
};
