import { FastifyPluginAsync } from 'fastify';
import { generateSunflake } from 'sunflake';

import { DB } from '../../../database';

export const generateSnowflake = generateSunflake();

export const DomainLsRoute: FastifyPluginAsync = async (router, options) => {
    router.get('/', async (_request, reply) => {
        reply.send(
            await DB.selectFrom('sites', '*', {
                owner: '123456789',
            })
        );
    });
};
