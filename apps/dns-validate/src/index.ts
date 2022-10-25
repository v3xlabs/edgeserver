import { createClient, RedisClientType } from 'redis';

import { CHANNELS, TIME } from './lib/constants';
import { DB } from './lib/database';
import { log } from './lib/logger';
import { verifyDNS } from './tasks/verifyDNS';

import { config } from 'dotenv';

import { parseENV, CONFIG } from '@edgelabs/env';

config();

export const Global = parseENV([CONFIG.CASSANDRA, CONFIG.REDIS]);

const client = createClient({ url: Global.REDIS_IP });

await client.connect();
await DB.awaitConnection();

process.on('SIGTERM', async () => {
    log.info('SIGTERM signal received.');
    await client.disconnect();
});

log.info('Open to receiving Instant Queue entries');

while (true) {
    const data = await client.BLPOP(CHANNELS.DNSINSTANTQUEUE, 10_000);

    if (!data) {
        log.info('No data found');
        continue;
    }

    log.info('Processing ', data.element);

    const dnsSuccess = await verifyDNS(data.element, client as RedisClientType);

    if (dnsSuccess) continue;

    log.info(
        'Failed to find a user that matches this information, re-queue-ing entry'
    );

    const now = Date.now();

    await client.ZADD(CHANNELS.DNSQUEUE, {
        score: now + TIME.REQUEUE,
        value: data.element,
    });
}
