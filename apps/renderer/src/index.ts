import { createClient } from 'redis';

import { processJob } from './jobqueue';
import { logger } from './logger';
import { JobData } from './screenshot';

const REDIS_QUEUE = 'edge_render_q';
const REDIS_WORKDER = 'edge_render_q_1';

const host = process.env.REDIS_HOST || 'localhost';
const port = process.env.REDIS_PORT || 6379;

const client = createClient({
    url: `redis://${host}:${port}`,
});

// You _can_ get the type like this but this is hard to do for all types:
export type RedisClientType = ReturnType<typeof createClient>;

(async () => {
    await client.connect();

    if (!client.isOpen) return;

    // await setupHTTP();

    while (client.isOpen) {
        const current_task = await client.lIndex(REDIS_WORKDER, 0);

        logger.debug('current_task', current_task);

        if (current_task) {
            const task = JSON.parse(current_task) as JobData;

            await processJob(client, task);
            await client.lRem(REDIS_WORKDER, -1, current_task);
            continue;
        }

        const next_task = await client.brPopLPush(
            REDIS_QUEUE,
            REDIS_WORKDER,
            0
        );

        logger.debug('next_task', next_task);

        if (next_task) {
            const task = JSON.parse(next_task) as JobData;

            await processJob(client, task);

            await client.lRem(REDIS_WORKDER, -1, next_task);
            continue;
        }

        logger.debug('Next task did not appear to exist');
    }
})();
