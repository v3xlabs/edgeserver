import { FastifyPluginAsync } from 'fastify';
import { generateSunflake } from 'sunflake';

import { DB } from '../../../database';
import { useAuth } from '../../../util/http/useAuth';

export const generateSnowflake = generateSunflake();

export const DomainLsRoute: FastifyPluginAsync = async (router, options) => {
    router.get('/', async (_request, reply) => {
        const authData = await useAuth(_request, reply);

        if (typeof authData !== 'string') return reply.send(authData);

        reply.send(
            await DB.selectFrom('sites', '*', {
                owner: authData,
            })
        );
    });
};
