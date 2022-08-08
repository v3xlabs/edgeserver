import { FastifyPluginAsync } from 'fastify';
import { generateSunflake } from 'sunflake';
import { CACHE } from '../../../../cache';

import { DB } from '../../../../database';
import { SafeError } from '../../../../util/error/SafeError';
import { AppEntryDeleteRoute } from './delete';
import { AppDeploysRoute } from './deploys';
import { AppEntryLinkRoute } from './link';

export const generateSnowflake = generateSunflake();

export type AppIDParameters = {
    Params: {
        app_id: string;
    };
};

export const AppEntryRoute: FastifyPluginAsync = async (router, _options) => {
    router.get<AppIDParameters>('/', async (_request, reply) => {
        const parameters = _request.params;

        ///TODO: Permission Verification
        const app = await DB.selectOneFrom('applications', '*', {
            app_id: parameters.app_id,
        });

        if (!app) throw new SafeError(404, '', 'no_app');

        const [last_deploy] = await DB.selectFrom(
            'deployments',
            ['deploy_id'],
            { app_id: app?.app_id },
            'ORDER BY deploy_id DESC'
        );

        const returner: object[] = [];

        if (last_deploy) {
            returner.push({
                last_deploy: last_deploy.deploy_id,
                preview_url: '/api/image/deploy/' + last_deploy.deploy_id,
            });

            const favicon_url = await CACHE.GET(
                `favicon:${last_deploy.deploy_id}`
            );

            if (favicon_url) {
                returner.push({ favicon_url });
            }
        }

        reply.send(Object.assign(app, ...returner));
    });

    router.register(AppEntryLinkRoute, { prefix: '/link' });

    router.register(AppDeploysRoute, { prefix: '/deploys' });

    router.register(AppEntryDeleteRoute, { prefix: '/delete' });
};
