import { DeploymentConfigV1 } from '@edgelabs/types';

import { Migration } from '../migrations';

export const deployment_configs_create: Migration<{
    deployment_configs: DeploymentConfigV1;
}> = async (database) => {
    await database.createTable(
        'deployment_configs',
        true,
        {
            deploy_id: {
                type: 'bigint',
            },
            headers: {
                type: 'text',
            },
            redirects: {
                type: 'text',
            },
            rewrites: {
                type: 'text',
            },
            routing: {
                type: 'text',
            },
            ssl: {
                type: 'text',
            },
        },
        'deploy_id'
    );
};
