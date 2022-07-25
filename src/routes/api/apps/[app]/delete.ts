import { Static, Type } from '@sinclair/typebox';
import { FastifyPluginAsync } from 'fastify';

import { DB } from '../../../../database';
import { useAuth } from '../../../../util/http/useAuth';
import { KeyPerms, usePerms } from '../../../../util/permissions';
import { AppIDParameters } from '.';

export const AppEntryDeleteRoute: FastifyPluginAsync = async (
    router,
    _options
) => {
    const domainPayload = Type.Object({
        domain_id: Type.String(),
    });

    router.delete<
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

            usePerms(permissions, [KeyPerms.APPS_DELETE]);

            await DB.deleteFrom('applications', '*', {
                app_id,
                owner_id: user_id,
            });
            await DB.deleteFrom('deployments', '*', { app_id });

            reply.status(200).send('OK');
        }
    );
};
