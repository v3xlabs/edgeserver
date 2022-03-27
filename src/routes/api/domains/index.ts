import { FastifyPluginAsync } from 'fastify';
import { generateSunflake } from 'sunflake';

export const generateSnowflake = generateSunflake();

export const DomainRoute: FastifyPluginAsync = async (router, options) => {
    router.get('/', (_request, reply) => {
        reply.send('stick');
    });
};
