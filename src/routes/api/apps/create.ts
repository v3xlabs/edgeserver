import { Static, Type } from '@sinclair/typebox';
import { FastifyPluginAsync } from 'fastify';

import { DB } from '../../../database';
import { ApplicationV3 } from '../../../types/Application.type';
import { useAuth } from '../../../util/http/useAuth';
import { log } from '../../../util/logging';
import { Poof } from '../../../util/sentry/sentryHandle';
import { generateSnowflake } from '.';
import { determineIfAuth } from './ls';

export const AppCreateRoute: FastifyPluginAsync = async (router, _options) => {
    const createPayload = Type.Object({
        name: Type.String(),
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

            const { name } = _request.body;

            const oldAppId = await DB.selectOneFrom(
                'applications',
                ['app_id'],
                { name }
            );

            if (oldAppId) {
                reply.status(409);
                reply.send({
                    error: 'Application already exists',
                });

                return;
            }

            // const {} = _request.body;
            // const domain_id = generateSnowflake();
            const createdProject: Partial<ApplicationV3> = {
                app_id: generateSnowflake(),
                owner_id: authData,
                name,
                // domain_id,
            };
            // const domain: Partial<DomainV1> = {
            //     domain_id,
            //     domain: deployment,
            //     user_id: authData,
            // };

            await DB.insertInto('applications', createdProject);
            // await DB.insertInto('domains', domain);

            reply.send({ site_id: createdProject.app_id });
        }
    );
};
