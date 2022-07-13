import { Static, Type } from '@sinclair/typebox';
import { utils } from 'ethers';
import { FastifyPluginAsync } from 'fastify';

import { Globals } from '../..';
import { DB } from '../../database';
import { brutalDeleteKey, getAuthKeys } from '../../services/auth/keys';
import {
    createExpiringAuthToken,
    createLongLivedAuthToken,
} from '../../services/auth/token';
import { SafeError } from '../../util/error/SafeError';
import { useAuth } from '../../util/http/useAuth';
import { log } from '../../util/logging';

export const KeysRoute: FastifyPluginAsync = async (router, _options) => {
    router.get('/', {}, async (request, reply) => {
        const { user_id } = await useAuth(request, reply);

        const keys = await getAuthKeys(user_id);

        reply.send({ keys });
    });

    const DeleteType = Type.Object({
        key_id: Type.RegEx(/^\d+$/g),
    });

    router.delete<{ Body: Static<typeof DeleteType> }>(
        '/',
        { schema: { body: DeleteType } },
        async (request, reply) => {
            const { user_id } = await useAuth(request, reply);

            const { key_id } = request.body;

            log.debug('Deleting User Key');
            brutalDeleteKey(BigInt(key_id), user_id);
        }
    );

    router.delete('/self', async (request, reply) => {
        const { user_id, key_id } = await useAuth(request, reply);

        log.debug('Deleting Self Key');
        brutalDeleteKey(key_id, user_id);
    });

    const SiwePayload = Type.Object({
        message: Type.String(),
        payload: Type.Object({
            action: Type.Literal('CREATE_KEY'),
            owner_id: Type.String(),
            instance_id: Type.Literal(Globals.INSTANCE_ID),
            data: Type.Object({
                permissions: Type.String(),
                name: Type.String(),
                expiresIn: Type.Optional(Type.String()),
                app_id: Type.Optional(Type.String()),
            }),
        }),
        signature: Type.String(),
    });

    router.post<{
        Body: Static<typeof SiwePayload>;
    }>(
        '/',
        {
            schema: {
                body: SiwePayload,
            },
        },
        async (request, reply) => {
            const { user_id } = await useAuth(request, reply);

            const { message, signature, payload } = request.body;

            let verifiedMessage;

            log.debug('hi');

            try {
                verifiedMessage = utils.verifyMessage(message, signature);
            } catch {
                throw new SafeError(
                    403,
                    '',
                    'keys-create-invalid-signature-error'
                );
            }

            log.debug({ verifiedMessage });
            const owner = await DB.selectOneFrom('owners', ['address'], {
                user_id,
            });

            const user = await DB.selectOneFrom('owners', ['user_id'], {
                address: verifiedMessage.toLowerCase(),
            });

            if (!user) throw new SafeError(403, '', 'keys-create-no-user');

            const format = JSON.parse(message);

            if (JSON.stringify(format) !== JSON.stringify(payload)) {
                throw new SafeError(
                    500,
                    '',
                    'keys-create-payload-not-matching'
                );
            }

            const token = payload.data.expiresIn
                ? await createExpiringAuthToken(
                      user_id,
                      BigInt(payload.data.permissions),
                      payload.data.name,
                      '',
                      payload.data.expiresIn
                  )
                : await createLongLivedAuthToken(
                      user_id,
                      BigInt(payload.data.permissions),
                      payload.data.name
                  );
            // const token = await createAndSignFullAccessToken(
            //     user.user_id,
            //     verifiedMessage.data.address.toLowerCase()
            // );

            reply.send({ token });
        }
    );
};
