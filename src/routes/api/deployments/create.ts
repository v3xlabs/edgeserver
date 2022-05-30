import { Static, Type } from '@sinclair/typebox';
import { FastifyPluginAsync } from 'fastify';

import { DB } from '../../../database';
import { ApplicationV2 } from '../../../types/Application.type';
import { DomainV1 } from '../../../types/Domain.type';
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
            const domain_id = generateSnowflake();
            const createdProject: Partial<ApplicationV2> = {
                app_id: generateSnowflake(),
                owner_id: authData,
                domain_id,
            };
            const domain: Partial<DomainV1> = {
                domain_id,
                domain: deployment,
                user_id: authData,
            };

            await DB.insertInto('applications', createdProject);
            await DB.insertInto('domains', domain);

            reply.send({ site_id: createdProject.app_id });
        }
    );
};
