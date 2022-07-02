import { FastifyPluginAsync } from 'fastify';
import { commandOptions } from 'redis';
import { generateSunflake } from 'sunflake';

import { Globals } from '../../..';
import { CACHE } from '../../../cache';

export const generateSnowflake = generateSunflake();

export const ImageDeployRoute: FastifyPluginAsync = async (router, options) => {
    router.get<{ Params: { domain_id: string; variant: string } }>(
        ':domain_id/:variant',
        { constraints: { host: Globals.SIGNAL_HOST } },
        async (request, reply) => {
            const data = await CACHE.HGET(
                commandOptions({ returnBuffers: true }),
                `images:${request.params.domain_id}`,
                request.params.variant
            );

            reply.type('webp');
            reply.status(200);
            reply.send(data);
        }
    );
    // router.register(MeRoute, { prefix: '/me' });
    // router.register(AppRoute, { prefix: '/apps' });
    // router.register(KeysRoute, { prefix: '/keys' });
    // router.register(DomainRoute, { prefix: '/domains' });
    // router.register(AdminRoute, { prefix: '/admin' });
};
