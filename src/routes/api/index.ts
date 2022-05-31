import { FastifyPluginAsync } from 'fastify';
import { generateSunflake } from 'sunflake';

import { AppRoute } from './apps';
import { DomainRoute } from './domains';
import { LoginRoute } from './login';

export const generateSnowflake = generateSunflake();

export const ApiRoute: FastifyPluginAsync = async (router, options) => {
    router.register(LoginRoute, { prefix: '/login' });
    router.register(AppRoute, { prefix: '/apps' });
    router.register(DomainRoute, { prefix: '/domains' });
};
