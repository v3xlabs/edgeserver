import { Static, Type } from '@sinclair/typebox';
import { FastifyPluginAsync } from 'fastify';

import { DB } from '../../../../database';
import { useAuth } from '../../../../util/http/useAuth';
import { KeyPerms, usePerms } from '../../../../util/permissions';
import { AppIDParameters } from '.';

export const AppEntryLinkRoute: FastifyPluginAsync = async (
    router,
    _options
) => {
    const domainPayload = Type.Object({
        domain_id: Type.String(),
    });

    router.post<
        {
            Body: Static<typeof domainPayload>;
        } & AppIDParameters
    >(
        '/',
        {
            schema: {
                body: domainPayload,
            },
        },
        async (_request, reply) => {
            const { app_id } = _request.params;
            const { user_id, permissions } = await useAuth(_request, reply);

            usePerms(permissions, [KeyPerms.APPS_WRITE]);

            const { domain_id } = _request.body;

            const oldAppId = await DB.selectOneFrom(
                'applications',
                ['app_id'],
                { app_id, owner_id: user_id }
            );

            if (!oldAppId) {
                reply.status(404);
                reply.send({
                    error: 'Application does not exists',
                });

                return;
            }

            await DB.update(
                'applications',
                { domain_id },
                { app_id, owner_id: user_id }
            );

            reply.status(200).send('OK');
        }
    );
};
