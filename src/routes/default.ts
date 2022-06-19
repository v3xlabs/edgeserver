import chalk from 'chalk';
import { FastifyPluginAsync } from 'fastify';
import { createReadStream } from 'node:fs';
import { join } from 'node:path';

import { routeGeneric, SafeError } from '../services/router';
import { sendError } from '../services/routing/send_error';
import { log } from '../util/logging';

export const GenericRouteV2: FastifyPluginAsync<{}> = async (router) => {
    router.get('*', async (request, reply) => {
        const url = request.hostname + request.url;

        try {
            await routeGeneric(request, reply);
            log.debug(`REQ ${url}`, chalk.greenBright('success'));
        } catch (error) {
            sendError(error, reply, url);
        }
    });
};
