import { Migration } from '../migrations';

export const deployments_timestamp: Migration<{}> = async (database) => {
    await database.raw('alter table deployments drop timestamp;');
};
