import { FastifyPluginAsync } from 'fastify';
import { generateSunflake } from 'sunflake';

import { DB } from '../../../../../database';
import { useAuth } from '../../../../../util/http/useAuth';
import { KeyPerms, usePerms } from '../../../../../util/permissions';
import { AppIDParameters } from '..';

export const generateSnowflake = generateSunflake();

export const DeploysTotalRoute: FastifyPluginAsync = async (
    router,
    _options
) => {
    router.get<AppIDParameters>('/', async (_request, reply) => {
        const { user_id: _user_id, permissions } = await useAuth(
            _request,
            reply
        );

        usePerms(permissions, [KeyPerms.DEPLOYMENTS_READ]);

        const data = await DB.rawWithParams(
            'SELECT COUNT(1) FROM ' +
                DB.keyspace +
                '.deployments WHERE app_id=?',
            [_request.params.app_id]
        );

        if (!data.rows.at(0)) return;

        const count = data.first().get(0);

        reply.send(count);
    });
};
