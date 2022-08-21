import { DomainV1 } from '@edgelabs/types';

import { Migration } from '../migrations';

export const domains_by_domain: Migration<{ domains: DomainV1 }> = async (
    database
) => {
    await database.createIndex('domains', 'domains_by_domain', 'domain');
};
