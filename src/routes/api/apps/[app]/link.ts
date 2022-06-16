import { Static, Type } from '@sinclair/typebox';
import { FastifyPluginAsync } from 'fastify';

import { DB } from '../../../../database';
import { useAuth } from '../../../../util/http/useAuth';
import { log } from '../../../../util/logging';
import { Poof } from '../../../../util/sentry/sentryHandle';
import { determineIfAuth } from '../ls';
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
            const authData = (await useAuth(_request, reply)) as Poof | string;

            if (determineIfAuth(authData)) {
                reply.status(authData.status || 500);
                reply.send();
                log.ok(...authData.logMessages);

                return;
            }

            const { domain_id } = _request.body;

            const oldAppId = await DB.selectOneFrom(
                'applications',
                ['app_id'],
                { app_id }
            );

            if (!oldAppId) {
                reply.status(404);
                reply.send({
                    error: 'Application does not exists',
                });

                return;
            }

            await DB.update('applications', { domain_id }, { app_id });

            reply.status(200).send('OK');
        }
    );
};
