import { Application } from '@edgelabs/types';
import { Static, Type } from '@sinclair/typebox';
import { FastifyPluginAsync } from 'fastify';

import { DB } from '../../../database';
import { useAuth } from '../../../util/http/useAuth';
import { KeyPerms, usePerms } from '../../../util/permissions';
import { generateSnowflake } from '.';

export const AppCreateRoute: FastifyPluginAsync = async (router, _options) => {
    const createPayload = Type.Object({
        name: Type.String(),
        domains: Type.Array(
            Type.Object({
                type: Type.Union([Type.Literal('ens'), Type.Literal('dns')]),
                name: Type.String(),
            }),
        ),
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
            const { user_id, permissions } = await useAuth(_request, reply);

            usePerms(permissions, [KeyPerms.APPS_WRITE]);

            const { name } = _request.body;

            const oldAppId = await DB.selectOneFrom(
                'applications',
                ['app_id'],
                { name, owner_id: user_id },
            );

            if (oldAppId) {
                reply.status(409);
                reply.send({
                    error: 'Application already exists',
                });

                return;
            }

            const createdProject: Partial<Application> = {
                app_id: BigInt(generateSnowflake()),
                owner_id: user_id,
                name,
                last_deployed: new Date().toString(),
            };
            // const domain: Partial<DomainV1> = {
            //     domain_id,
            //     domain: deployment,
            //     user_id: authData,
            // };

            await DB.insertInto('applications', createdProject);

            // await DB.insertInto('domains', domain);

            reply.send({ site_id: createdProject.app_id });
        },
    );
};
