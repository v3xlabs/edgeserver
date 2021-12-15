import Express from 'express';
import { config } from 'dotenv';
import { initDB } from './Data';
import { handleRequest } from './lookup/RequestHandler';
import { log } from './util/logging';
import { KeyRouter } from './handlers/keys';
import { DeploymentRouter } from './handlers/deployments';
import { useHost } from './auth/useHost';

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
