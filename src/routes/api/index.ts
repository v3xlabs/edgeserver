import { FastifyPluginAsync } from 'fastify';
import { generateSunflake } from 'sunflake';

import { DeploymentRoute } from './deployments';
import { LoginRoute } from './login';

export const generateSnowflake = generateSunflake();

export const ApiRoute: FastifyPluginAsync = async (router, options) => {
    router.register(LoginRoute, { prefix: '/login' });
    router.register(DeploymentRoute, { prefix: '/domain' });
};
