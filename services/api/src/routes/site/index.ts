import { FastifyPluginAsync, RouteHandler } from 'fastify';

import { DB } from '../../database/index.js';
import { TokenRoute } from '../tokens/index.js';
import { GetSiteDeploysRoute } from './deploy/all.js';
import { DomainRoute } from './domains/index.js';

export type SiteParameters = {
    Params: {
        site_id: string;
    };
};

export const SiteRoute: FastifyPluginAsync = async (router) => {
    router.get('/', GetSiteRoute);
    router.get('/deploys', GetSiteDeploysRoute);
    router.register(DomainRoute, { prefix: '/domains' });
    router.register(TokenRoute, { prefix: '/tokens' });
};

export const GetSiteRoute: RouteHandler<SiteParameters> = async (
    request,
    reply
) => {
    const v = await DB.selectOneFrom('sites', '*', {
        site_id: request.params.site_id,
    });

    reply.send(JSON.stringify(v));
};
