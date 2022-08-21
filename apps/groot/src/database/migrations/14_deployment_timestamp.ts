import { DeploymentV4 } from '@edgelabs/types';

import { Migration } from '../migrations';

export const deployments_timestamp: Migration<{
    deployments: DeploymentV4;
}> = async (database) => {
    await database.raw('drop index deployments_by_app_id');
    await database.raw('alter table deployments drop timestamp;');
    await database.createIndex(
        'deployments',
        'deployments_by_app_id',
        'app_id'
    );
};
