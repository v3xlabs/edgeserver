import Express from 'express';
import { config } from 'dotenv';
import { initDB } from './Data';
import { handleRequest } from './lookup/RequestHandler';
import { log } from './util/logging';

config();

(async () => {
    await initDB();

    log.lifecycle('Starting Express');
    const app = Express();

    app.use(handleRequest);

    app.listen(1234, () => {
        log.lifecycle('Done ✨');
    });
})();
