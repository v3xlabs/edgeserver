import { Migration } from '../migrations';

export const deployments_date: Migration<{}> = async (database) => {
    await database.raw('alter table deployments add timestamp timestamp;');
    await database.raw('alter table deployments add sid text;');
    await database.raw('alter table deployments add cid text;');
    await database.raw('alter table deployments drop created_on;');
};
