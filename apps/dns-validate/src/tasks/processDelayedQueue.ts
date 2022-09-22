import { createClient } from 'redis';

import { CHANNELS, TIME } from '../lib/constants';
import { log } from '../lib/logger';

const client = createClient();

await client.connect();

export const processTemporaryQueue = async () => {
    log.info('Processing Temporary Queue');

    while (true) {
        const f = await client.zPopMinCount(
            CHANNELS.DNSTEMPQUEUE,
            CHANNELS.TEMP_BATCH_SIZE
        );

        log.info(`Popped ${f.length} entries from ` + CHANNELS.DNSTEMPQUEUE);

        if (f.length === 0) break;

        await client.RPUSH(
            CHANNELS.DNSINSTANTQUEUE,
            f.map((a) => a.value)
        );
    }

    log.info('Completed processing Temporary Queue');
};

export const processDelayedQueue = async () => {
    const now = Date.now();

    await processTemporaryQueue();

    log.info(`Moving the next ${TIME.GAP} seconds worth of entries.`);

    // Copy the next gap worth of entries to the temp queue
    const storedAmount = await client.zRangeStore(
        CHANNELS.DNSTEMPQUEUE,
        CHANNELS.DNSQUEUE,
        -1,
        now + TIME.GAP,
        { BY: 'SCORE' }
    );

    // Remove the gap worth of entries from the main queue.
    const removedAmount = await client.ZREMRANGEBYSCORE(
        CHANNELS.DNSQUEUE,
        -1,
        now + TIME.GAP
    );

    log.info(`Moved a total of ${storedAmount} entries for queue-ing`);

    if (removedAmount > 0) await processTemporaryQueue();
};

await processDelayedQueue();
await client.disconnect();
