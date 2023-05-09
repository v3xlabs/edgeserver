import { Domain } from '@edgelabs/types';
import { RouteHandler } from 'fastify';

import { DB } from '../../../../database/index.js';
import { SiteParameters } from '../../index.js';
import { calculateDomainCreateState } from './_process.js';

export const PostDomainsHandler: RouteHandler<
    SiteParameters & {
        Body: {
            domain: string;
        };
    }
> = async (request, reply) => {
    const domainState = await calculateDomainCreateState(
        request.body.domain,
        request.token.address
    );

    if (!domainState.success) return reply.status(400).send({ success: false });

    const domain: Domain = {
        domain: request.body.domain,
        site_id: request.params.site_id,
        routing_policy: 'static',
    };

    await DB.insertInto('domains', domain);

    reply.status(201).send(domain);
};
