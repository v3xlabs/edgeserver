import { FastifyPluginAsync } from 'fastify';
import { generateSunflake } from 'sunflake';

import { Auth } from '../../../../middleware/auth';
import { AppDeploysRoute } from './deploys';

export const generateSnowflake = generateSunflake();

export type AppIDParameters = {
    Params: {
        app_id: string;
    };
};
export const AppEntryRoute: FastifyPluginAsync = async (router, _options) => {
    router.register(Auth);

    router.get<AppIDParameters>('/', (_request, reply) => {
        reply.send('stick');
    });

    router.register(AppDeploysRoute, { prefix: '/deploys' });
};
