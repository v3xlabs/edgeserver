import { FastifyPluginAsync } from 'fastify';

import { DB } from '../../../../database';
import { useAuth } from '../../../../util/http/useAuth';
import { KeyPerms, usePerms } from '../../../../util/permissions';
import { AppIDParameters } from '.';

export const AppEntryDeleteRoute: FastifyPluginAsync = async (
    router,
    _options
) => {
    router.delete<AppIDParameters>('/', async (_request, reply) => {
        const { app_id } = _request.params;
        const { user_id, permissions } = await useAuth(_request, reply);

        usePerms(permissions, [KeyPerms.APPS_DELETE]);

        const found = await DB.selectOneFrom('applications', ['app_id'], {
            app_id,
            owner_id: user_id,
        });

        if (!found) reply.status(404).send();

        await DB.deleteFrom('applications', '*', {
            app_id,
            owner_id: user_id,
        });

        const result = await DB.selectFrom('deployments', ['deploy_id'], {
            app_id,
        });

        await DB.deleteFrom('deployments', '*', { app_id });

        const batch = DB.batch();

        for (const row of result) {
            const { deploy_id } = row;

            if (!deploy_id) continue;

            batch.deleteFrom('deployment_configs', '*', { deploy_id });
        }

        if (batch.queries.length > 0) await batch.execute();

        reply.status(200).send('OK');
    });
};
