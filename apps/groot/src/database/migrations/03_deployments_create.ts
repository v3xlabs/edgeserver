import { DeploymentLookupV1, DeploymentV1 } from '@edgelabs/types';

import { Migration } from '../migrations';

export const deployments_create: Migration<{
    deployments: DeploymentV1;
    dlt: DeploymentLookupV1;
}> = async (database) => {
    await database.createTable(
        'deployments',
        true,
        {
            app_id: {
                type: 'bigint',
            },
            deploy_id: {
                type: 'bigint',
            },
            created_on: {
                type: 'date',
            },
        },
        'deploy_id',
        ['app_id'],
    );
    await database.createTable(
        'dlt',
        true,
        {
            base_url: {
                type: 'text',
            },
            app_id: {
                type: 'bigint',
            },
            deploy_id: {
                type: 'bigint',
            },
        },
        'base_url',
    );
};
