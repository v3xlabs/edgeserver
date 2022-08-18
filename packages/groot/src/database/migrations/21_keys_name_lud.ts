import { Migration } from '../migrations';

export const keys_name_lud: Migration<{}> = async (database) => {
    await database.raw('alter table keys add name TEXT');
    await database.raw('alter table keys add last_use_data TEXT');
};
