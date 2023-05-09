import { DeploymentV1 } from '@edgelabs/types';

import { Migration } from '../migrations.js';

export const create_deployments: Migration<{
    deployments: DeploymentV1;
}> = async (database, log) => {
    log('Ensuring Tables');
    await database.createTable(
        'deployments',
        true,
        {
            deploy_id: {
                type: 'text',
            },
            site_id: {
                type: 'bigint',
            },
            created_at: {
                type: 'timestamp',
            },
        },
        'deploy_id'
    );
    await database.createIndex(
        'deployments',
        'deployments_by_site_id',
        'site_id'
    );
};
