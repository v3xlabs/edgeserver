import { DeploymentV4, DeploymentV5 } from '@edgelabs/types';
import { ScylloClient } from 'scyllo';

import { log } from '../../util/logging';
import { Migration } from '../migrations';

const createTable = async (
    database: ScylloClient<{
        deployments: DeploymentV5;
    }>,
    table_name: string
) => {
    await database.createTable(
        table_name as 'deployments',
        true,
        {
            app_id: {
                type: 'bigint',
            },
            deploy_id: {
                type: 'bigint',
            },
            cid: {
                type: 'text',
            },
            context: {
                type: 'text',
            },
            sid: {
                type: 'text',
            },
        },
        'app_id',
        ['deploy_id']
    );
};

export const rebuild_deployments: Migration<{
    deployments: DeploymentV4;
    deployments_tmp: DeploymentV5;
}> = async (database) => {
    log.debug('creating table');
    await createTable(database, 'deployments_tmp');

    // await new Promise((r) => setTimeout(r, 20_000));

    log.debug('getting ol');
    const deployments_from_old = await database.selectFrom('deployments', [
        'app_id',
        'deploy_id',
    ]);

    for (const deployment of deployments_from_old) {
        const deploymentData = await database.selectOneFrom(
            'deployments',
            '*',
            { app_id: deployment.app_id, deploy_id: deployment.deploy_id }
        );

        await database.insertInto('deployments_tmp', {
            app_id: deploymentData?.app_id,
            cid: deploymentData?.cid,
            context: '',
            deploy_id: deploymentData?.deploy_id,
            sid: deploymentData?.sid,
        });
    }

    await database.dropTable('deployments');

    await createTable(database, 'deployments');

    const deployments_form_intermediary = await database.selectFrom(
        'deployments_tmp',
        ['app_id', 'deploy_id']
    );

    for (const deployment of deployments_form_intermediary) {
        const deploymentData = await database.selectOneFrom(
            'deployments_tmp',
            '*',
            {
                app_id: deployment.app_id,
                deploy_id: deployment.deploy_id,
            }
        );

        await (
            database as ScylloClient<{ deployments: DeploymentV5 }>
        ).insertInto('deployments', deploymentData as DeploymentV5);
    }

    await database.dropTable('deployments_tmp');
};
