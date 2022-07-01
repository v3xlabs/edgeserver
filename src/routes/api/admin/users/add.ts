import { Static, Type } from '@sinclair/typebox';
import { utils } from 'ethers';
import { FastifyPluginAsync } from 'fastify';

import { DB } from '../../../../database';
import { SafeError } from '../../../../util/error/SafeError';
import { useAuth } from '../../../../util/http/useAuth';
import { generateSnowflake } from '..';

export const UsersAddRoute: FastifyPluginAsync = async (router, _options) => {
    const UsersAddPayload = Type.Object({
        message: Type.String(),
        payload: Type.Object({
            action: Type.Literal('USERS_ADD'),
            address: Type.String(),
        }),
        signature: Type.String(),
    });

    router.post<{
        Body: Static<typeof UsersAddPayload>;
    }>(
        '/',
        {
            schema: {
                body: UsersAddPayload,
            },
        },
        async (_request, reply) => {
            const { user_id } = await useAuth(_request, reply, {
                adminOnly: true,
            });

            const { message, signature, payload } = _request.body;

            // Verify the signature
            let signatureAddress: string;

            try {
                signatureAddress = utils.verifyMessage(message, signature);
            } catch {
                throw new SafeError(
                    403,
                    '',
                    'admin-users-add-invalid-signature-error'
                );
            }

            // Check if payload and signed message match
            const format = JSON.parse(message);

            if (JSON.stringify(format) !== JSON.stringify(payload))
                throw new SafeError(
                    500,
                    '',
                    'admin-users-add-payload-not-matching'
                );

            // Check admin status
            const data = await DB.selectOneFrom(
                'owners',
                ['admin', 'address'],
                {
                    user_id,
                }
            );

            // Check if user is admin
            if (!data || !data.admin) {
                throw new SafeError(403, '', 'admin-users-add-not-admin');
            }

            // Check if addresses match
            if (data.address !== signatureAddress.toLowerCase()) {
                throw new SafeError(
                    403,
                    '',
                    'admin-users-add-payload-address-not-matching'
                );
            }

            // Check if address is already whitelisted
            const old_data = await DB.selectOneFrom('owners', ['address'], {
                address: payload.address.toLowerCase(),
            });

            if (old_data)
                throw new SafeError(409, '', 'admin-users-add-already-exists');

            // Create new whitelist entry
            const new_user_id = generateSnowflake();

            await DB.insertInto('owners', {
                address: payload.address.toLowerCase(),
                user_id: new_user_id,
                admin: false,
            });

            // Respond with user id
            reply.send({
                user_id: new_user_id,
            });
        }
    );
};
