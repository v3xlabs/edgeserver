import { FastifyPluginAsync } from 'fastify';
import { generateSunflake } from 'sunflake';

import { CACHE } from '../../../cache';
import { DB } from '../../../database';
import { useAuth } from '../../../util/http/useAuth';
import { log } from '../../../util/logging';
import { KeyPerms, usePerms } from '../../../util/permissions';

export const generateSnowflake = generateSunflake();

export const AppLsRoute: FastifyPluginAsync = async (router, _options) => {
    router.get('/', async (_request, reply) => {
        const { user_id, permissions } = await useAuth(_request, reply);

        usePerms(permissions, [KeyPerms.APPS_READ]);

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

                const favicon_url = await CACHE.GET(
                    `favicon:${last_deploy.deploy_id}`
                );

                if (!favicon_url) {
                    return {
                        ...app,
                        last_deploy: last_deploy.deploy_id,
                        preview_url:
                            '/api/image/deploy/' + last_deploy.deploy_id,
                    };
                }

                return {
                    ...app,
                    last_deploy: last_deploy.deploy_id,
                    preview_url: '/api/image/deploy/' + last_deploy.deploy_id,
                    favicon_url,
                };
            })
        );

        log.debug(applicationsAndDomains);

        reply.send(applicationsAndDomains);
    });
};
