import { config } from 'dotenv';
import Express from 'express';

import { useHost } from './auth/useHost';
import { initDB } from './Data';
import { DeploymentRouter } from './handlers/deployments';
import { KeyRouter } from './handlers/keys';
import { handleRequest } from './lookup/RequestHandler';
import { log } from './util/logging';

config();

(async () => {
    await initDB();

    log.lifecycle('Starting Express');
    const app = Express();

    app.use('/keys', useHost(KeyRouter));
    app.use('/deployments', useHost(DeploymentRouter));
    app.use(handleRequest);

    app.listen(1234, () => {
        log.lifecycle('Done ✨');
    });
})();
