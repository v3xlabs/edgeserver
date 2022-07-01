import { FastifyPluginAsync } from 'fastify';
import { generateSunflake } from 'sunflake';

import { DB } from '../../../../database';
import { SafeError } from '../../../../util/error/SafeError';
import { useAuth } from '../../../../util/http/useAuth';
export const generateSnowflake = generateSunflake();

export const UsersLsRoute: FastifyPluginAsync = async (router, _options) => {
    router.get('/', async (_request, reply) => {
        const { user_id } = await useAuth(_request, reply);

        const data = await DB.selectOneFrom('owners', ['admin'], {
            user_id,
        });

        if (!data || !data.admin) {
            throw new SafeError(403, '', 'admin-users-add-not-admin');
        }

        reply.send(await DB.selectFrom('owners', '*', {}));
    });
};
