import { Migration } from '../migrations';

export const auth_key_upgrade: Migration<{}> = async (database) => {
    await database.raw('alter table keys add permissions TEXT');
    await database.raw('alter table keys add state SMALLINT');
    await database.raw('alter table keys add last_use TIMESTAMP');
};
