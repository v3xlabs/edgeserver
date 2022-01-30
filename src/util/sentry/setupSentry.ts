import { init, Integrations } from '@sentry/node';

import { log } from '../logging';

export const setupSentry = () => {
    log.lifecycle('Initializing Sentry for environment ' + 'dev-luc');
    init({
        dsn: process.env.SENTRY_DSN,
        tracesSampleRate: 1,
        environment: 'dev-luc',
        integrations: [new Integrations.Http({ tracing: true })],
    });
};
