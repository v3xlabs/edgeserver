import { FastifyPluginAsync } from 'fastify';

import { SiweSessionRoute } from './session.js';
import { SiweVerifyRoute } from './verify.js';

export const SiweRoute: FastifyPluginAsync<{}> = async (router) => {
    router.register(SiweVerifyRoute, { prefix: '/verify' });
    router.register(SiweSessionRoute, { prefix: '/session' });
};
