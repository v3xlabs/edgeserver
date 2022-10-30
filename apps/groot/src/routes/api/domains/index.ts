import { FastifyPluginAsync } from 'fastify';
import { generateSunflake } from 'sunflake';

import { DomainCreateRoute } from './create';
import { DomainsEntryRoute } from './get';
import { DomainsLsRoute } from './ls';
import { DomainsUlsRoute } from './uls';

export const generateSnowflake = generateSunflake();

export const DomainRoute: FastifyPluginAsync = async (router, _options) => {
    router.register(DomainsLsRoute, { prefix: '/ls' });
    router.register(DomainsUlsRoute, { prefix: '/uls' });
    router.register(DomainCreateRoute, { prefix: '/create' });
    router.register(DomainsEntryRoute, { prefix: '/:domain_id' });
};
