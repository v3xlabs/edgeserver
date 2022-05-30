import { ApplicationV2 } from '../../types/Application.type';
import { Migration } from '../migrations';

export const domain_ownership: Migration<{
    applications: ApplicationV2;
}> = async (database) => {
    await database.raw('alter table applications add domain_id bigint;');
};
