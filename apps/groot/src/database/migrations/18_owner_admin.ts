import { Migration } from '../migrations';

export const owner_admin: Migration<{}> = async (database) => {
    await database.raw('alter table owners add admin BOOLEAN');
};
