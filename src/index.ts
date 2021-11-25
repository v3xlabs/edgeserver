import Express from 'express';
import { config } from 'dotenv';
import { initDB } from './Data';
import { handleRequest } from './lookup/RequestHandler';

config();

(async () => {
    await initDB();

    console.log('Starting Express');
    const app = Express();

    app.use(handleRequest);

    app.listen(1234, () => {
        console.log('Done ✨');
    });
})();
