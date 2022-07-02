import Cors from '@fastify/cors';
import chalk from 'chalk';
import { config } from 'dotenv';
import { fastify } from 'fastify';

import { initDB } from './database';
import { ApiRoute } from './routes/api';
import { GenericRouteV2 } from './routes/default';
import { CreateRoute } from './routes/protected/create';
import { sendError } from './services/routing/send_error';
import { GenericStorage } from './storage/GenericStorage';
import { SignalStorage } from './storage/SignalFS';
import { log } from './util/logging';
import { setupLogger } from './util/setupLogger';

config();

const obfusicate = (value: string) => {
    return '*'.repeat(value.length);
};

export const Globals = {
    SIGNALFS_HOST: process.env.SIGNALFS_IP || '0.0.0.0:8000',
    DB_DATACENTER: process.env.DB_DATACENTER || 'localdatacenter1',
    DB_IP: process.env.DB_IP || '0.0.0.0:9042',
    SIGNAL_MASTER: process.env.SIGNAL_MASTER || '',
    SIGNAL_HOST: process.env.SIGNAL_HOST || '',
    SENTRY_DSN: process.env.SENTRY_DSN || '',
    ENVIRONMENT: process.env.ENVIRONMENT || 'dev',
    SENTRY_SAMPLE_RATE: process.env.ENVIRONMENT == 'production' ? 0.1 : 1,
    INSTANCE_ID: process.env.INSTANCE_ID || 'localhost',
};

export const StorageBackend: GenericStorage = new SignalStorage();

(async () => {
    log.empty();
    log.settings(
        'Starting the system with the following configuration',
        'ENVIRONMENT ' + chalk.gray(Globals.ENVIRONMENT),
        'SIGNALFS_HOST ' + chalk.gray(Globals.SIGNALFS_HOST),
        'DB_IP ' + chalk.gray(Globals.DB_IP),
        'DB_DATACENTER ' + chalk.gray(Globals.DB_DATACENTER),
        'SIGNAL_MASTER ' +
            (Globals.SIGNAL_MASTER
                ? chalk.gray(obfusicate(Globals.SIGNAL_MASTER))
                : chalk.red('MISSING')),
        'SENTRY_DSN ' +
            (Globals.SENTRY_DSN
                ? chalk.gray(Globals.SENTRY_DSN)
                : chalk.red('MISSING')),
        'SAMPLE RATE ' + chalk.gray(Globals.SENTRY_SAMPLE_RATE),
        'INSTANCE_ID ' + chalk.gray(Globals.INSTANCE_ID)
    );
    log.empty();

    const server = fastify({
        logger: false,
        ajv: { customOptions: { keywords: ['kind', 'modifier'] } },
    });

    setupLogger(server, log);

    /* Initiate Error Handling */
    // setupSentry();

    await initDB();

    log.lifecycle('Starting Express');

    server.register(Cors, {
        origin: true,
        methods: ['GET', 'PUT', 'POST', 'DELETE'],
    });

    server.register(CreateRoute, { prefix: '/deployments' });
    server.register(ApiRoute, { prefix: '/api' });
    server.register(GenericRouteV2);

    server.setErrorHandler((error, request, reply) => {
        sendError(error, reply, request.hostname + request.url);
    });

    server.listen({ port: 1234, host: '0.0.0.0' }, (error) => {
        if (error) {
            log.error(error);

            return;
        }

        log.lifecycle('Done ✨');
    });
})();
