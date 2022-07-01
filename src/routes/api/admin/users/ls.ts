import { FastifyPluginAsync } from 'fastify';
import { generateSunflake } from 'sunflake';

import { DB } from '../../../../database';
import { useAuth } from '../../../../util/http/useAuth';
export const generateSnowflake = generateSunflake();

export const UsersLsRoute: FastifyPluginAsync = async (router, _options) => {
    router.get('/', async (_request, reply) => {
        await useAuth(_request, reply, { adminOnly: true });

        reply.send(await DB.selectFrom('owners', '*', {}));
    });
};
