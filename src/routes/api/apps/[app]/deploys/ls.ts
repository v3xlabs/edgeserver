import { FastifyPluginAsync } from 'fastify';
import { generateSunflake } from 'sunflake';

import { DB } from '../../../../../database';
import { useAuth } from '../../../../../util/http/useAuth';
import { AppIDParameters } from '..';

export const generateSnowflake = generateSunflake();

export const DeploysLsRoute: FastifyPluginAsync = async (router, _options) => {
    router.get<AppIDParameters>('/', async (_request, reply) => {
        const { user_id: _user_id } = await useAuth(_request, reply);

        reply.send(
            await DB.selectFrom(
                'deployments',
                '*',
                {
                    app_id: _request.params.app_id,
                },
                'ORDER BY deploy_id DESC LIMIT 50'
            )
        );
    });
};
