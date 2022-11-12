import { Static, Type } from '@sinclair/typebox';
import { utils } from 'ethers';
import { FastifyPluginAsync } from 'fastify';

import { Globals } from '../../../..';
import { DB } from '../../../../database';
import { SafeError } from '../../../../util/error/SafeError';
import { useAuth } from '../../../../util/http/useAuth';
import { KeyPerms, usePerms } from '../../../../util/permissions';
import { AppIDParameters } from '.';

export const AppEntryDeleteRoute: FastifyPluginAsync = async (
    router,
    _options
) => {
    const SiwePayload = Type.Object({
        message: Type.String(),
        payload: Type.Object({
            action: Type.Literal('DELETE_APP'),
            owner_id: Type.String(),
            instance_id: Type.Literal(Globals.INSTANCE_ID),
            app_id: Type.String(),
        }),
        signature: Type.String(),
    });

    router.delete<AppIDParameters & {
        Body: Static<typeof SiwePayload>;
    }>('/', async (_request, reply) => {
        const { app_id } = _request.params;
        const { user_id, permissions } = await useAuth(_request, reply);

        usePerms(permissions, [KeyPerms.APPS_DELETE]);

        const { message, signature, payload } = _request.body;

        let verifiedMessage: string;

        try {
            verifiedMessage = utils.verifyMessage(message, signature);
        } catch {
            throw new SafeError(
                403,
                '',
                'app-delete-invalid-signature-error'
            );
        }

        const found = await DB.selectOneFrom('applications', ['app_id'], {
            app_id,
            owner_id: user_id,
        });

        if (!found) reply.status(404).send();

        const format = JSON.parse(message);

        if (JSON.stringify(format) !== JSON.stringify(payload)) {
            throw new SafeError(
                500,
                '',
                'app-delete-payload-not-matching'
            );
        }

        if (payload.app_id !== app_id) {
            throw new SafeError(
                500,
                '',
                'app-delete-payload-app-id-not-matching'
            );
        }

        // user_id has type of bigint while not being, to protect against a future fix, we make sure it's a string
        if (payload.owner_id !== String(user_id)) {
            throw new SafeError(
                500,
                '',
                'app-delete-payload-owner-id-not-matching'
            );
        }

        await DB.deleteFrom('applications', '*', {
            app_id,
            owner_id: user_id,
        });

        const result = await DB.selectFrom('deployments', ['deploy_id'], {
            app_id,
        });

        await DB.deleteFrom('deployments', '*', { app_id });

        const batch = DB.batch();

        for (const row of result) {
            const { deploy_id } = row;

            if (!deploy_id) continue;

            batch.deleteFrom('deployment_configs', '*', { deploy_id });
        }

        if (batch.queries.length > 0) await batch.execute();

        reply.status(200).send('OK');
    });
};
