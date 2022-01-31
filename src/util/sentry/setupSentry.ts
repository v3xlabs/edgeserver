import { init, Integrations } from '@sentry/node';
import chalk from 'chalk';

import { Globals } from '../..';
import { log } from '../logging';

export const setupSentry = () => {
    log.lifecycle(
        'Initializing Sentry for environment ' + chalk.gray(Globals.ENVIRONMENT)
    );
    init({
        dsn: Globals.SENTRY_DSN,
        tracesSampleRate: Globals.SENTRY_SAMPLE_RATE,
        environment: Globals.ENVIRONMENT,
        integrations: [new Integrations.Http({ tracing: true })],
    });
};
