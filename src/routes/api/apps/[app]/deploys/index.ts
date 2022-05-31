import { FastifyPluginAsync } from 'fastify';
import { generateSunflake } from 'sunflake';

import { Auth } from '../../../../../middleware/auth';
import { useAuth } from '../../../../../util/http/useAuth';
import { DeploysLsRoute, determineIfAuth } from './ls';

export const generateSnowflake = generateSunflake();

export const AppDeploysRoute: FastifyPluginAsync = async (router, _options) => {
    router.register(Auth);

    router.get('/', (_request, reply) => {
        reply.send('stick');
    });

    export const DeploysEntryRoute: FastifyPluginAsync = async (router, _options) => {
        router.get<DeployIDParams>('/', async (_request, reply) => {
            const authData = (await useAuth(_request, reply)) as Poof | string;

            if (determineIfAuth(authData)) {
                reply.status(authData.status || 500);
                reply.send();
                log.ok(...authData.logMessages);

                return;
            }

            reply.send(
                await DB.selectFrom(
                    'deployments',
                    '*',
                    {
                        app_id: _request.params.app_id,
                    },
                    'LIMIT 50'
                )
            );
        });
    };

    router.register(DeploysLsRoute, { prefix: '/ls' });
};
