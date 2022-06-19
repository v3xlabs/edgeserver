import { FastifyPluginAsync } from 'fastify';
import { generateSunflake } from 'sunflake';

import { DB } from '../../../../../database';
import { useAuth } from '../../../../../util/http/useAuth';

export const generateSnowflake = generateSunflake();

export const DeploysEntryRoute: FastifyPluginAsync = async (
    router,
    _options
) => {
    router.get<{
        Params: {
            app_id: string;
            deploy_id: string;
        };
    }>('/', async (_request, reply) => {
        const authData = await useAuth(_request, reply);

        reply.send(
            await DB.selectFrom(
                'deployments',
                '*',
                {
                    app_id: _request.params.app_id,
                    deploy_id: _request.params.deploy_id,
                },
                'LIMIT 50'
            )
        );
    });
};
