import { Deployment } from '@edgelabs/types';
import { RouteHandler } from 'fastify';

import { DB } from '../../../database/index.js';
import { snowflake } from '../../../utils/snowflake.js';
import { SiteParameters } from '../index.js';

/**
 * Creates a new deployment for a site.
 */
export const PostDeployRoute: RouteHandler<SiteParameters> = async (
    request,
    reply
) => {
    const { site_id } = request.params;

    const deployment: Deployment = {
        site_id,
        deploy_id: snowflake(),
        created_at: new Date().toISOString(),
    };

    await DB.insertInto('deployments', deployment);

    reply.send(JSON.stringify(deployment));
};
