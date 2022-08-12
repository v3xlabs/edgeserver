import { FastifyPluginAsync } from 'fastify';
import { generateSunflake } from 'sunflake';
import { CACHE } from '../../../../cache';

import { DB } from '../../../../database';
import { SafeError } from '../../../../util/error/SafeError';
import { useAuth } from '../../../../util/http/useAuth';
import { log } from '../../../../util/logging';
import { KeyPerms, usePerms } from '../../../../util/permissions';

export const generateSnowflake = generateSunflake();

export const DeploysRenderRoute: FastifyPluginAsync = async (
    router,
    _options
) => {
    router.get<{
        Params: {
            app_id: string;
        };
    }>('/', async (_request, reply) => {
        const { user_id, permissions } = await useAuth(_request, reply);

        usePerms(permissions, [KeyPerms.DEPLOYMENTS_WRITE]);

        const app = await DB.selectOneFrom('applications', ['domain_id'], {
            app_id: _request.params.app_id,
            owner_id: user_id,
        });

        if (!app) throw new SafeError(404, '', 'app-render-no-app');

        const deployment = await DB.selectOneFrom(
            'deployments',
            '*',
            {
                app_id: _request.params.app_id,
            },
            'ORDER BY deploy_id DESC'
        );

        if (!deployment) throw new SafeError(404, '', 'app-render-no-deploys');

        const domain = await DB.selectOneFrom('domains', ['domain'], {
            domain_id: app.domain_id,
        });

        if (!domain) throw new SafeError(404, '', 'app-render-no-domain');

        log.ok('Triggering render for ' + deployment.deploy_id);
        const renderConfig = {
            id: deployment.deploy_id,
            url: 'http://' + domain.domain,
            viewport: '1920x1080',
            scales: ['128', '256'],
        };

        CACHE.LPUSH('edge_render_q', JSON.stringify(renderConfig));

        reply.send('OK');
    });
};
