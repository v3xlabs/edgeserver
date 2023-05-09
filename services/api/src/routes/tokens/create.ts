import { Token } from '@edgelabs/types';
import { RouteHandler } from 'fastify';
import { generateSunflake } from 'sunflake';

import { DB } from '../../database/index.js';
import { TeamOrSiteParameters } from './index.js';

const snowflake = generateSunflake();

export const PostTokenRoute: RouteHandler<
    TeamOrSiteParameters & {
        Body: {
            name: string;
        };
    }
> = async (request, reply) => {
    const { team_id, site_id } = request.params;

    // Verify team exists

    // Verify site exists (if site_id is provided)
    if (site_id) {
        const { team_id } = await DB.selectOneFrom('sites', ['team_id'], {
            site_id,
        });

        if (team_id !== team_id) {
            throw new Error('Site does not belong to this team.');
        }
    }

    const token: Token = {
        name: 'test',
        permissions: BigInt(0),
        // eslint-disable-next-line unicorn/no-null
        revoked_at: null,
        team_id,
        token_id: snowflake(),
        site_id,
    };

    await DB.insertInto('tokens', token);

    reply.send(token);
};
