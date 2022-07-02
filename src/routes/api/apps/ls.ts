import { FastifyPluginAsync } from 'fastify';
import { generateSunflake } from 'sunflake';

import { DB } from '../../../database';
import { useAuth } from '../../../util/http/useAuth';
import { log } from '../../../util/logging';

export const generateSnowflake = generateSunflake();

export const AppLsRoute: FastifyPluginAsync = async (router, _options) => {
    router.get('/', async (_request, reply) => {
        const { user_id } = await useAuth(_request, reply);

        const applications = await DB.selectFrom(
            'applications_by_user' as 'applications',
            '*',
            {
                owner_id: user_id,
            },
            ' ORDER BY last_deployed DESC'
        );

        log.debug(applications);

        const applicationsAndDomains = await Promise.all(
            applications.map(async (app) => {
                const [last_deploy] = await DB.selectFrom(
                    'deployments',
                    ['deploy_id'],
                    { app_id: app.app_id },
                    'ORDER BY deploy_id DESC'
                );

                if (!last_deploy) return app;

                return {
                    ...app,
                    preview_url: '/api/image/deploy/' + last_deploy.deploy_id,
                };
            })
        );

        log.debug(applicationsAndDomains);

        reply.send(applicationsAndDomains);
    });
};
