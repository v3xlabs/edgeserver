import { FastifyPluginAsync } from 'fastify';
import { generateSunflake } from 'sunflake';

import { AdminCheckRoute } from './check';
import { AdminSetupRoute } from './setup';
import { UsersRoute } from './users';

export const generateSnowflake = generateSunflake();

export const AdminRoute: FastifyPluginAsync = async (router, _options) => {
    router.register(AdminCheckRoute, { prefix: '/check' });
    router.register(AdminSetupRoute, { prefix: '/setup' });
    router.register(UsersRoute, { prefix: '/users' });
};
