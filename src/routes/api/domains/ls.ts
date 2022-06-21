import { FastifyPluginAsync } from 'fastify';
import { generateSunflake } from 'sunflake';

import { DB } from '../../../database';
import { useAuth } from '../../../util/http/useAuth';

export const generateSnowflake = generateSunflake();

export const DomainsLsRoute: FastifyPluginAsync = async (router, _options) => {
    router.get('/', async (_request, reply) => {
        const { user_id } = await useAuth(_request, reply);

        reply.send(
            await DB.selectFrom('domains', '*', {
                user_id,
            })
        );
    });
};
