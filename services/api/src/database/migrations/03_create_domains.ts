import { DomainV1 } from '@edgelabs/types';

import { Migration } from '../migrations.js';

export const create_domains: Migration<{
    domains: DomainV1;
}> = async (database, log) => {
    log('Ensuring Tables');

    await database.createTable(
        'domains',
        true,
        {
            domain: {
                type: 'text',
            },
            site_id: {
                type: 'bigint',
            },
            routing_config: {
                type: 'text',
            },
            routing_policy: {
                type: 'text',
            },
        },
        'domain'
    );

    await database.raw(
        'CREATE MATERIALIZED VIEW domains_by_site_id AS SELECT * FROM domains WHERE site_id IS NOT NULL PRIMARY KEY (site_id, domain);'
    );
};
