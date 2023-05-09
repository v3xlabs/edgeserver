import { FastifyPluginAsync, RouteHandler } from 'fastify';

import { DB } from '../../../database/index.js';
import { SiteParameters } from '../index.js';
import { GetSiteDeploysRoute } from './all.js';
import { PostDeployRoute } from './create.js';

export type DeployParameters = {
    Params: {
        deploy_id: string;
    };
};

export const SiteRoute: FastifyPluginAsync = async (router) => {
    router.get('/', GetSiteDeploysRoute);
    router.post('/', PostDeployRoute);
    router.get('/:deploy_id', GetDeployRoute);
};

export const GetDeployRoute: RouteHandler<
    DeployParameters & SiteParameters
> = async (request, reply) => {
    const v = await DB.selectOneFrom('deployments', '*', {
        site_id: request.params.site_id,
        deploy_id: request.params.deploy_id,
    });

    reply.send(JSON.stringify(v));
};
