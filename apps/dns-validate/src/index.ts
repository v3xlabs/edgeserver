import { createClient } from 'redis';

import { CHANNELS } from './lib/constants';
import { log } from './lib/logger';

const client = createClient();

await client.connect();

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

    log.info('processing', data);
}
