import { DomainV1 } from '../../types/Domain.type';
import { Migration } from '../migrations';

export const domains_by_domain: Migration<{ domains: DomainV1 }> = async (
    database
) => {
    await database.createIndex('domains', 'domains_by_domain', 'domain');
};
