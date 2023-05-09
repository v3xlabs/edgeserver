import { onRequestHookHandler } from 'fastify';
import * as jwt from 'jsonwebtoken';
import { generatePermissions } from 'permissio';
import { z } from 'zod';

import { DB } from '../database/index.js';
import { log } from '../utils/logger.js';

const tokenSchema = z.object({
    token_id: z.string(),
    edge_address: z.string(),
    edge_domain: z.string(),
});

export type ForwardedTokenData = {
    token_id: string;
    address: string;
    team_id: string;
    site_id?: string;
    permissions: ReturnType<typeof generatePermissions>;
};

declare module 'fastify' {
    export interface FastifyRequest {
        token?: ForwardedTokenData;
    }
}

export const authRoute: onRequestHookHandler = async (request, reply) => {
    try {
        // Get token from header
        const raw_token = request.headers.authorization?.split(' ')[1];

        // If there is no token
        if (!raw_token) reply.status(400);

        // Decode token
        const data = jwt.verify(raw_token, 'SECRET');

        // Validate token
        const { token_id, edge_address, edge_domain } = tokenSchema.parse(data);

        // TODO: Verify domain = env.domain
        // if (edge_domain !== process.env.EDGE_HOST) return reply.status(400);

        // Get token from DB
        const token_data = await DB.selectOneFrom(
            'tokens',
            ['revoked_at', 'permissions', 'site_id', 'team_id'],
            {
                token_id,
            }
        );

        // If there is no token in DB
        if (!token_data) return reply.status(400);

        // Invalidate if revoked
        if (token_data.revoked_at) return reply.status(400);

        // Create ForwardedTokenData
        const token: ForwardedTokenData = {
            token_id,
            address: edge_address,
            team_id: token_data.team_id,
            site_id: token_data.site_id,
            permissions: generatePermissions(token_data.permissions),
        };

        // Add token to request
        request.token = token;
    } catch (error) {
        log.error('Invalid Auth Attempt', error);
        reply.status(500);
    }
};
