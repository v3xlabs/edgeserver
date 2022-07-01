import { FastifyPluginAsync } from 'fastify';
import { generateSunflake } from 'sunflake';

import { UsersAddRoute } from './add';
import { UsersLsRoute } from './ls';

export const generateSnowflake = generateSunflake();

export const UsersRoute: FastifyPluginAsync = async (router, _options) => {
    router.register(UsersAddRoute, { prefix: '/add' });
    router.register(UsersLsRoute, { prefix: '/ls' });
};
