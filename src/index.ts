import { startTransaction } from '@sentry/node';
import { Transaction } from '@sentry/types';
import { config } from 'dotenv';
import { fastify } from 'fastify';
import { fastifyRequestContextPlugin } from 'fastify-request-context';

import { initDB } from './database';
import { GenericRoute } from './routes/generic';
import { GenericStorage } from './storage/GenericStorage';
import { SignalStorage } from './storage/SignalFS';
import { log } from './util/logging';
import { setupSentry } from './util/sentry/setupSentry';
import { setupLogger } from './util/setupLogger';

config();

export const Globals = {
    SIGNALFS_HOST: process.env.SIGNALFS_IP || '0.0.0.0:8000',
};

export const StorageBackend: GenericStorage = new SignalStorage();

(async () => {
    const server = fastify();

    setupLogger(server, log);

    /* Initiate Error Handling */
    setupSentry();

    await initDB();

    log.lifecycle('Starting Express');

    // server.register((server ))

    // server.register(fastifyRequestContextPlugin, {
    //     hook: 'preValidation',
    //     defaultStoreValues: {
    //         transaction: undefined as Transaction,
    //     },
    // });

    server.register(GenericRoute);
    // app.use('/keys', useHost(KeyRouter));
    // app.use('/deployments', useHost(DeploymentRouter));
    // app.use(handleRequest);

    // app.use(Sentry.Handlers.errorHandler());

    server.listen(1234, '0.0.0.0', () => {
        log.lifecycle('Done ✨');
    });
})();
