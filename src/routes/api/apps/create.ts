import { Static, Type } from '@sinclair/typebox';
import { FastifyPluginAsync } from 'fastify';

import { DB } from '../../../database';
import { Application } from '../../../types/Application.type';
import { useAuth } from '../../../util/http/useAuth';
import { generateSnowflake } from '.';

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
            const { user_id } = await useAuth(_request, reply);

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
            const createdProject: Partial<Application> = {
                app_id: generateSnowflake(),
                owner_id: user_id,
                name,
                last_deployed: new Date().toString(),
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
