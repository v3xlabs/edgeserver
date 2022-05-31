import { FastifyPluginAsync } from 'fastify';
import { generateSunflake } from 'sunflake';

import { Auth } from '../../../middleware/auth';
import { DomainCreateRoute } from './create';
import { DomainsEntryRoute } from './get';
import { DomainsLsRoute } from './ls';

export const generateSnowflake = generateSunflake();

export const DomainRoute: FastifyPluginAsync = async (router, _options) => {
    router.register(Auth);

    router.register(DomainsLsRoute, { prefix: '/ls' });
    router.register(DomainCreateRoute, { prefix: '/create' });
    router.register(DomainsEntryRoute, { prefix: '/:domain_id' });
};
