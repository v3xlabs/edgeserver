import { Static, Type } from '@sinclair/typebox';
import { FastifyPluginAsync } from 'fastify';

import { DB } from '../../../database';
import { Site } from '../../../types/Site.type';
import { useAuth } from '../../../util/http/useAuth';
import { log } from '../../../util/logging';
import { Poof } from '../../../util/sentry/sentryHandle';
import { generateSnowflake } from '.';
import { determineIfAuth } from './ls';

export const DeploymentCreateRoute: FastifyPluginAsync = async (
    router,
    options
) => {
    const createPayload = Type.Object({
        deployment: Type.String(),
    });

    router.post<{
        Body: Static<typeof createPayload>;
    }>(
        '/',
        {
            schema: {
                body: createPayload,
            },
        },
        async (_request, reply) => {
            const authData = (await useAuth(_request, reply)) as Poof | string;

            if (determineIfAuth(authData)) {
                reply.status(authData.status || 500);
                reply.send();
                log.ok(...authData.logMessages);

                return;
            }

            const { deployment } = _request.body;
            const createdProject: Site = {
                site_id: generateSnowflake(),
                owner: authData,
                host: deployment,
                cid: '',
            };

            await DB.insertInto('sites', createdProject);

            reply.send({ site_id: createdProject.site_id });
        }
    );
};
