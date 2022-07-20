import { Static, Type } from '@sinclair/typebox';
import { FastifyPluginAsync } from 'fastify';
import { SiweMessage } from 'siwe';
import { generateSunflake } from 'sunflake';

import { DB } from '../../../database';
import { SafeError } from '../../../util/error/SafeError';

export const generateSnowflake = generateSunflake();

export const AdminSetupRoute: FastifyPluginAsync = async (router, _options) => {
    const SiwePayload = Type.Object({
        message: Type.Object({}),
        signature: Type.String(),
    });

    router.get('/check', async (_request, reply) => {
        const data = await DB.selectOneFrom('owners', ['admin'], {});

        reply.send({
            configured: !!data,
        });
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
        async (_request, reply) => {
            const message = new SiweMessage(_request.body.message);

            try {
                await message.validate(_request.body.signature);
            } catch {
                throw new SafeError(
                    403,
                    '',
                    'admin-setup-invalid-signature-error'
                );
            }

            // If data returned, an admin already exists
            const data = await DB.selectOneFrom('owners', ['admin'], {});

            if (data) {
                throw new SafeError(
                    423,
                    'EdgeServer is already configured',
                    'admin-setup-already-setup-error'
                );
            }

            // Create admin user
            const user_id = BigInt(generateSnowflake());

            await DB.insertInto('owners', {
                admin: true,
                address: message.address.toLowerCase(),
                user_id,
            });

            reply.send({
                user_id,
            });
        }
    );
};
