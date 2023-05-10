import { DeploymentV1, DeploymentV2 } from '@edgelabs/types';

import { Migration } from '../migrations.js';

export const create_deployment_data: Migration<{
    deployments: DeploymentV2;
}> = async (database, log) => {
    log('Ensuring Tables');
    await database.raw(
        'ALTER TABLE deployments ADD resolution text;'
    );
    await database.raw(
        'ALTER TABLE deployments ADD storage text;'
    );
    await database.raw(
        'ALTER TABLE deployments ADD storage_id text;'
    );
    await database.raw(
        'ALTER TABLE deployments ADD source text;'
    );
    await database.raw(
        'ALTER TABLE deployments ADD source_meta text;'
    );
};
