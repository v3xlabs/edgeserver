import { FastifyPluginAsync } from 'fastify';
import jwt from 'jsonwebtoken';
import { SiweMessage } from 'siwe';

import { log } from '../../utils/logger.js';

export const SiweVerifyRoute: FastifyPluginAsync<{}> = async (router) => {
    router.post<{
        Body: {
            message: string;
            signature: string;
        };
    }>('/', async (request, reply) => {
        request.body = JSON.parse(request.body as any);

        log.info('Hello Worldzz', request.body);

        const siweMessage = new SiweMessage(request.body.message);

        const { success, error } = await siweMessage.verify({
            signature: request.body.signature,
        });

        if (!success) {
            return reply.send({
                success: false,
                error,
            });
        }

        log.info('SIGNING');

        try {
            const token = jwt.sign(
                {
                    token_id: '1',
                    edge_address: siweMessage.address,
                    edge_domain: siweMessage.domain,
                },
                'SECRET'
            );

            return reply.send({
                token,
            });
        } catch (error_) {
            log.error(error_);
        }
    });
};
