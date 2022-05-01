import { FastifyPluginAsync } from 'fastify';

import { log } from '../util/logging';

export const Auth: FastifyPluginAsync = async (request, reply) => {
    log.debug('AUTH');
};
