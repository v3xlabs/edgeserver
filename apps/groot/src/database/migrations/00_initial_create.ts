import { AuthKeyV1, OwnerV1, SiteV1 } from '@edgelabs/types';

import { Migration } from '../migrations';

export const initial_create: Migration<{
    owners: OwnerV1;
    sites: SiteV1;
    keys: AuthKeyV1;
}> = async (database, log) => {
    log('Ensuring Tables');
    await database.createTable(
        'owners',
        true,
        {
            user_id: {
                type: 'bigint',
            },
            address: {
                type: 'text',
            },
        },
        'user_id',
    );
    await database.createIndex('owners', 'owners_by_address', 'address');
    await database.createTable(
        'sites',
        true,
        {
            host: { type: 'text' },
            owner: { type: 'bigint' },
            site_id: { type: 'bigint' },
            cid: { type: 'text' },
        },
        'site_id',
    );
    await database.createIndex('sites', 'sites_by_owner', 'owner');
    await database.createIndex('sites', 'sites_by_host', 'host');
    await database.createTable(
        'keys',
        true,
        {
            key: { type: 'text' },
            owner_id: { type: 'bigint' },
        },
        'key',
    );

    await database.createIndex('keys', 'keys_by_owner', 'owner_id');
};
