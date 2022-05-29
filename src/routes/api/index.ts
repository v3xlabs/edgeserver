import { FastifyPluginAsync } from 'fastify';
import { generateSunflake } from 'sunflake';

import { DomainRoute } from './domains';
import { LoginRoute } from './login';

export const generateSnowflake = generateSunflake();

export const ApiRoute: FastifyPluginAsync = async (router, options) => {
    router.register(LoginRoute, { prefix: '/login' });
    router.register(DomainRoute, { prefix: '/domain' });
};
