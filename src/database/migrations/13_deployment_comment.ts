import { Migration } from '../migrations';

export const deployment_comment: Migration<{}> = async (database) => {
    await database.raw('alter table deployments add comment text;');
    await database.raw('alter table deployments add git_sha text;');
    await database.raw('alter table deployments add git_src smallint;');
    await database.raw('alter table deployments add git_type smallint;');
    await database.raw('alter table deployments add git_actor text;');
};
