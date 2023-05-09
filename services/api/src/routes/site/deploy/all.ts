import { RouteHandler } from 'fastify';

import { DB } from '../../../database/index.js';
import { SiteParameters } from '../index.js';

export const GetSiteDeploysRoute: RouteHandler<SiteParameters> = async (
    request,
    reply
) => {
    const v = await DB.selectFrom(
        'deployments',
        '*',
        {
            site_id: request.params.site_id,
        },
        'LIMIT 10'
    );

    reply.send(JSON.stringify(v));
};
