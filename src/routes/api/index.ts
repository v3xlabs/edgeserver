import { FastifyPluginAsync } from 'fastify';
import { generateSunflake } from 'sunflake';

import { AdminRoute } from './admin';
import { AppRoute } from './apps';
import { DomainRoute } from './domains';
import { KeysRoute } from './keys';
import { LoginRoute } from './login';

export const generateSnowflake = generateSunflake();

export const ApiRoute: FastifyPluginAsync = async (router, options) => {
    router.register(LoginRoute, { prefix: '/login' });
    router.register(AppRoute, { prefix: '/apps' });
    router.register(KeysRoute, { prefix: '/keys' });
    router.register(DomainRoute, { prefix: '/domains' });
    router.register(AdminRoute, { prefix: '/admin' });
};
