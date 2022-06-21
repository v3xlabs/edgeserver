import { FastifyPluginAsync } from 'fastify';
import { generateSunflake } from 'sunflake';

import { DB } from '../../../database';
import { useAuth } from '../../../util/http/useAuth';

export const generateSnowflake = generateSunflake();

export const DomainsEntryRoute: FastifyPluginAsync = async (
    router,
    _options
) => {
    router.get<{
        Params: {
            domain_id: string;
        };
    }>('/', async (_request, reply) => {
        const { user_id } = await useAuth(_request, reply);

        reply.send(
            await DB.selectOneFrom('domains', '*', {
                domain_id: _request.params.domain_id,
            })
        );
    });
};
