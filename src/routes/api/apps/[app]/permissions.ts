import { Static, Type } from '@sinclair/typebox';
import { FastifyPluginAsync } from 'fastify';

import { DB } from '../../../../database';
import { useAuth } from '../../../../util/http/useAuth';
import { log } from '../../../../util/logging';
import { Poof } from '../../../../util/sentry/sentryHandle';
import { determineIfAuth } from '../ls';

export const ApplicationPermissionRoute: FastifyPluginAsync = async (
    router,
    options
) => {
    const createPayload = Type.Object({
        message: Type.Object({
            user_id: Type.String(),
            permissions: Type.String(),
        }),
    });

    /**
     * @api {PUT} /api/apps/permissions/
     *
     * @apiName CreateAppPermission
     *
     * @apiGroup ApplicationPermission
     *
     * Input:
     * @apiParam {String} user_id
     * @apiParam {String} permissions
     *
     * Return:
     * @apiSuccess {Status} 200
     * @apiForbidden {Status} 403
     */
    router.put<{
        Params: {
            app_id: string;
        };
        Body: Static<typeof createPayload>;
    }>(
        '/',
        {
            schema: {
                body: createPayload,
            },
        },
        async (_request, reply) => {
            const { app_id } = _request.params;
            const authData = (await useAuth(_request, reply)) as Poof | string;

            if (determineIfAuth(authData)) {
                reply.status(authData.status || 500);
                reply.send();
                log.ok(...authData.logMessages);

                return;
            }

            const { message } = _request.body;
            const { user_id, permissions } = message;
            const owner = await DB.selectOneFrom('owners', '*', {
                user_id: authData,
            });

            if (!owner) {
                reply.status(403);
                reply.send();
                log.warning('Not valid user');

                return;
            }

            const owner_id = owner.user_id;

            log.network(`Deployment permissions for ${app_id} by ${owner_id}`);
            const application = await DB.selectOneFrom('applications', '*', {
                app_id,
            });

            if (!application) {
                reply.status(403);
                reply.send();
                log.warning('Not valid app');

                return;
            }

            if (String(application.owner_id) !== String(owner_id)) {
                reply.status(403);
                reply.send();
                log.error('Unauthorized');

                return;
            }

            const app_perms = {
                ...application.permissions,
                [user_id]: permissions,
            };

            log.network(app_perms);
            const insertedPermissions = await DB.insertInto('applications', {
                app_id,
                owner_id,
                permissions: app_perms,
            });

            reply.status(200).send();
        }
    );
};
