import { FastifyPluginAsync, RouteHandler } from 'fastify';

import { DB } from '../../database/index.js';
import { log } from '../../utils/logger.js';
import { PostTokenRoute } from './create.js';

export type TeamOrSiteParameters = {
    Params: {
        team_id?: string;
        site_id?: string;
    };
};

export const TokenRoute: FastifyPluginAsync = async (router) => {
    router.get('/', GetTokenRoute);
    router.post('/', PostTokenRoute);
};

export const GetTokenRoute: RouteHandler<TeamOrSiteParameters> = async (
    request,
    reply
) => {
    const { team_id, site_id } = request.params;

    log.debug('TOKENROUTE', team_id, site_id);

    const parameters = site_id ? { site_id } : { team_id };

    const token_object = await DB.selectFrom('tokens', '*', parameters);

    reply.send(token_object);
};
