import { FastifyPluginAsync } from 'fastify';
import { generateSunflake } from 'sunflake';

import { DB } from '../../../../database';
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

    router.get<AppIDParameters>('/', async (_request, reply) => {
        const parameters = _request.params;
        const app = await DB.selectOneFrom('applications', '*', {
            app_id: parameters.app_id,
        });

        reply.send(app);
    });

    router.register(AppDeploysRoute, { prefix: '/deploys' });
};
