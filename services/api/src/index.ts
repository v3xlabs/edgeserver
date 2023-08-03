import Cors from '@fastify/cors';
import chalk from 'chalk';
import fastify from 'fastify';

import { initDB } from './database/index.js';
import { ApiRoute } from './routes/index.js';
import { polyfillBigInt } from './utils/bigintJSON.js';
import { log } from './utils/logger.js';

polyfillBigInt();

const globals = {
    ENVIRONMENT: process.env.ENVIRONMENT,
    SIGNALFS_HOST: process.env.SIGNALFS_HOST,
    DB_IP: process.env.DB_IP,
    DB_DATACENTER: process.env.DB_DATACENTER,
    INSTANCE_ID: process.env.INSTANCE_ID,
    REDIS_IP: process.env.REDIS_IP,
};

log.empty();
log.settings(
    'Starting the system with the following configuration',
    'ENVIRONMENT ' + chalk.gray(globals.ENVIRONMENT),
    'SIGNALFS_HOST ' + chalk.gray(globals.SIGNALFS_HOST),
    'DB_IP ' + chalk.gray(globals.DB_IP),
    'DB_DATACENTER ' + chalk.gray(globals.DB_DATACENTER),
    'INSTANCE_ID ' + chalk.gray(globals.INSTANCE_ID),
    'REDIS_IP ' + chalk.gray(globals.REDIS_IP)
);
log.empty();

await initDB();

const server = fastify({
    logger: false,
    ajv: { customOptions: { keywords: ['kind', 'modifier'] } },
});

log.info('Starting Express');

server.register(Cors, {
    origin: true,
    methods: ['GET', 'PUT', 'POST', 'DELETE'],
});

server.addHook('onError', (request, reply, error) => {
    log.error(error);

    if (reply.sent) return;

    reply.status(500).send(error);
});

server.register(ApiRoute, { prefix: '/' });

// server.setErrorHandler((error, request, reply) => {
//     sendError(error, reply, request.hostname + request.url);
// });

server.listen({ port: 1234, host: '0.0.0.0' }, (error) => {
    if (error) {
        log.error(error);

        return;
    }

    log.info('Done ✨');
});
