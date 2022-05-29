import Cors from '@fastify/cors';
import chalk from 'chalk';
import { config } from 'dotenv';
import { fastify } from 'fastify';

import { initDB } from './database';
import { ApiRoute } from './routes/api';
import { GenericRoute } from './routes/generic';
import { CreateRoute } from './routes/protected/create';
import { GenericStorage } from './storage/GenericStorage';
import { SignalStorage } from './storage/SignalFS';
import { log } from './util/logging';
import { setupSentry } from './util/sentry/setupSentry';
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
    SENTRY_DSN: process.env.SENTRY_DSN || '',
    ENVIRONMENT: process.env.ENVIRONMENT || 'dev',
    SENTRY_SAMPLE_RATE: process.env.ENVIRONMENT == 'production' ? 0.1 : 1,
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
        'SAMPLE RATE ' + chalk.gray(Globals.SENTRY_SAMPLE_RATE)
    );
    log.empty();

    const server = fastify();

    setupLogger(server, log);

    /* Initiate Error Handling */
    setupSentry();

    await initDB();

    log.lifecycle('Starting Express');

    server.register(Cors, {
        origin: true,
        allowedHeaders: ['GET', 'PUT', 'POST'],
    });
    server.register(CreateRoute, { prefix: '/deployments' });
    server.register(ApiRoute, { prefix: '/api' });
    server.register(GenericRoute);

    server.listen(1234, '0.0.0.0', () => {
        log.lifecycle('Done ✨');
    });
})();
