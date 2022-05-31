import { Static, Type } from '@sinclair/typebox';
import { FastifyPluginAsync } from 'fastify';

import { DB } from '../../../database';
import { useAuth } from '../../../util/http/useAuth';
import { log } from '../../../util/logging';
import { Poof } from '../../../util/sentry/sentryHandle';
import { determineIfAuth } from './ls';

export const DeploymentPermissionRoute: FastifyPluginAsync = async (
    router,
    options
) => {
    const createPayload = Type.Object({
        message: Type.Object({
            app_id: Type.String(),
            instance_id: Type.String(),
            user_id: Type.String(),
            permissions: Type.String(),
        }),
        signature: Type.String(),
    });

    router.put<{
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

            const { message, signature } = _request.body;
            const { app_id, instance_id, user_id, permissions } = message;
            const owner = await DB.selectOneFrom('owners', '*', {
                address: signature,
            });
            const owner_id = owner.user_id;

            log.network(`Deployment permissions for ${app_id} by ${owner_id}`);
            const application = await DB.selectOneFrom('applications', '*', {
                app_id,
            });

            if (Number(application.owner_id) !== Number(owner_id)) {
                reply.status(401);
                reply.send({ msg: 'Unauthorized' });
                log.error('Unauthorized');

                return;
            }

            const app_perms = {
                ...application.permissions,
                [user_id]: permissions,
            };

            log.network(app_perms);

            // const insertedPermissions = await DB.raw(`UPDATE signal.applications SET permissions = ${JSON.stringify(app_perms)} WHERE app_id = ${app_id}`);
            const insertedPermissions = await DB.insertInto('applications', {
                app_id,
                owner_id,
                permissions: app_perms,
            });

            reply.send(insertedPermissions);
        }
    );
};
