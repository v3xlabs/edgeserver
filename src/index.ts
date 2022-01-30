import * as Sentry from '@sentry/node';
import * as Tracing from '@sentry/tracing';
import { config } from 'dotenv';
import Express from 'express';

import { useHost } from './auth/useHost';
import { initDB } from './Data';
import { DeploymentRouter } from './handlers/deployments';
import { KeyRouter } from './handlers/keys';
import { handleRequest } from './lookup/RequestHandler';
import { log } from './util/logging';

config();

export const shouldSentry = !!process.env.SENTRY_DSN;

export const Globals = {
    SIGNALFS_HOST: process.env.SIGNALFS_IP || '0.0.0.0:8000',
};

(async () => {
    const app = Express();

    /* Initiate Error Handling */
    if (shouldSentry) {
        log.lifecycle('Initializing Sentry for environment ' + 'dev-luc');
        Sentry.init({
            dsn: process.env.SENTRY_DSN,
            tracesSampleRate: 1,
            environment: 'dev-luc',
            integrations: [
                new Sentry.Integrations.Http({ tracing: true }),
                new Tracing.Integrations.Express({
                    // to trace all requests to the default router
                    app,
                    // alternatively, you can specify the routes you want to trace:
                    // router: someRouter,
                }),
            ],
        });
    }

    await initDB();

    log.lifecycle('Starting Express');

    app.use(Sentry.Handlers.requestHandler());

    app.use('/keys', useHost(KeyRouter));
    app.use('/deployments', useHost(DeploymentRouter));
    app.use(handleRequest);

    app.use(Sentry.Handlers.errorHandler());

    app.listen(1234, () => {
        log.lifecycle('Done ✨');
    });
})();
