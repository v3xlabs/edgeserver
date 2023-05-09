import { FastifyPluginAsync, RouteHandler } from 'fastify';

import { DB } from '../../../database/index.js';
import { SiteParameters } from '../index.js';
import { PostDomainsHandler } from './create/index.js';
import { GetDomainAvailabilityRoute } from './create/simulate.js';

export type DomainParameters = {
    Params: {
        domain_id: string;
    };
};

export const DomainRoute: FastifyPluginAsync = async (router) => {
    router.get('/', GetDomainsRoute);
    router.post('/', PostDomainsHandler);
    router.get('/available', GetDomainAvailabilityRoute);
};

export const GetDomainsRoute: RouteHandler<SiteParameters> = async (
    request,
    reply
) => {
    const v = await DB.selectFrom('domains_by_site_id' as 'domains', '*', {
        site_id: request.params.site_id,
    });

    reply.send(JSON.stringify(v));
};
