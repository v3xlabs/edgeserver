import { resolveTxt } from 'node:dns/promises';
import { RedisClientType } from 'redis';

import { log } from '../lib/logger';

const DNS_REGEX = /a=(0x[\dA-Za-z]{40})/g;

export const verifyDNS = async (domain: string, client: RedisClientType) => {
    const edgeRecords = await resolveTxt(`_edge.${domain}`).catch(() => []);
    const ensRecords = await resolveTxt(`_ens.${domain}`).catch(() => []);

    const addresses = [];

    for (const edgeRecord of [...edgeRecords, ...ensRecords]) {
        for (const ab of edgeRecord) {
            const v = DNS_REGEX.exec(ab);

            if (v && v.length >= 2) {
                addresses.push(v[1]);
            }
        }
    }

    log.info(addresses);

    if (addresses.length > 0) {
        log.info('Found records for ' + domain);
        // It only runs for whats found first.
        // _edge overwrites _ens
        const address = addresses[0].toString().toLowerCase();

        // Validate user exists and is part of crew thats requesting this name.
        const user = await client.sIsMember('dns:domains:' + domain, address);

        if (!user) {
            log.info(
                'User does not appear to be requesting this domain on this node'
            );
            return false;
        }

        log.info('Found user address match with dns address');

        await client.del('dns:domains:' + domain);
        await client.sRem('dns:users:' + address, domain);

        log.info('Domain given to user');
        // TODO: Add domain in db
        // TODO: Notify user

        return true;
    }

    return false;
};
