import { resolveTxt } from 'node:dns/promises';

import { log } from '../lib/logger';

const DNS_REGEX = /a=(0x[\dA-Za-z]{40})/g;

export const verifyDNS = async (domain: string) => {
    const edgeRecords = await resolveTxt(`_edge.${domain}`).catch(() => []);
    const ensRecords = await resolveTxt(`_ens.${domain}`).catch(() => []);

    const addresses = [];

    for (const edgeRecord of [...edgeRecords, ...ensRecords]) {
        for (const ab of edgeRecord) {
            const v = DNS_REGEX.exec(ab);

            if (v && v.length > 2) {
                addresses.push(v[1]);
            }
        }
    }

    log.info(addresses);

    if (addresses.length > 0) {
        log.info('Found records for ' + domain);

        // Validate user exists and is part of crew thats requesting this name.
        // const user =
    }

    return false;
};
