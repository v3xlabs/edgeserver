import { Static, Type } from '@sinclair/typebox';
import { FastifyPluginAsync } from 'fastify';
import { toPermissionsBuffer } from 'permissio';
import { SiweMessage } from 'siwe';

import { DB } from '../../database';
import {
    getFullPermissions,
    serializePermissions,
} from '../../services/auth/permissions';
import { createExpiringAuthToken } from '../../services/auth/token';
import { SafeError } from '../../util/error/SafeError';
import { log } from '../../util/logging';
import { FullPerm } from '../../util/permissions';

export const LoginRoute: FastifyPluginAsync = async (router, _options) => {
    router.get<{
        Params: {
            address: string;
        };
    }>(
        '/whitelist/:address',
        {
            schema: {
                params: {
                    type: 'object',
                    properties: {
                        address: { type: 'string' },
                    },
                    required: ['address'],
                },
            },
        },
        async (request, reply) => {
            const user = await DB.selectOneFrom('owners', ['user_id'], {
                address: request.params.address.toLowerCase(),
            });

            reply.send({
                exists: !!user,
            });
        }
    );

    const SiwePayload = Type.Object({
        message: Type.Object({}),
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
            log.debug(request.body as {});
            const message = new SiweMessage(request.body.message);

            try {
                await message.validate(request.body.signature);
            } catch {
                throw new SafeError(
                    403,
                    '',
                    'keys-create-invalid-signature-error'
                );
            }

            const user = await DB.selectOneFrom('owners', ['user_id'], {
                address: message.address.toLowerCase(),
            });

            if (!user) throw new SafeError(403, '', 'keys-create-no-user');

            const now = new Date();

            const token = await createExpiringAuthToken(
                user.user_id,
                FullPerm,
                `Browser Token (${now.toDateString()})`,
                '10h'
            );

            reply.send({ token });
        }
    );
};
