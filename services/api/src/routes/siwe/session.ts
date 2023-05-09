import { FastifyPluginAsync } from 'fastify';

export const SiweSessionRoute: FastifyPluginAsync<{}> = async (router) => {
    router.get('/', async (request, reply) => {
        const token = request.headers['authorization'];

        if (!token) {
            return reply.status(401).send();
        }

        return reply.status(200).send();
    });
};
