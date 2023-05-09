import { RouteHandler } from 'fastify';

import { DB } from '../../database/index.js';
import { TeamParameters } from './index.js';

export const SitesRoute: RouteHandler<TeamParameters> = async (
    request,
    reply
) => {
    const v = await DB.selectFrom('sites', '*', {
        team_id: request.params.team_id,
    });

    reply.send(JSON.stringify(v));
};
