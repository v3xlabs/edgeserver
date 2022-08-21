import { DomainV1 } from '@edgelabs/types';

import { Migration } from '../migrations';

export const domains_create: Migration<{
    domains: DomainV1;
}> = async (database) => {
    await database.createTable(
        'domains',
        true,
        {
            domain_id: {
                type: 'bigint',
            },
            domain: {
                type: 'text',
            },
            user_id: {
                type: 'bigint',
            },
            permissions: {
                type: 'text',
            },
        },
        'domain_id',
        ['user_id']
    );
};
