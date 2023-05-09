import { RouteHandler } from 'fastify';

import { hasUserAccessToSite } from '../../../../rules/auth.js';
import { log } from '../../../../utils/logger.js';
import { calculateDomainCreateState } from './_process.js';

export const GetDomainAvailabilityRoute: RouteHandler<{
    Querystring: {
        domain: string;
    };
}> = async (request, reply) => {
    const domainState = await calculateDomainCreateState(
        request.query.domain,
        request.token.address
    );

    const statusCode = domainState.success ? 200 : 400;

    let { domain_available } = domainState;

    log.debug('da', domain_available);

    if (typeof domain_available === 'string') {
        const vx = await hasUserAccessToSite(
            domain_available as string,
            request.token.address
        );

        if (!vx) domain_available = false;
    }

    domainState.domain_available = domain_available;

    reply.status(statusCode).send(domainState);
};
