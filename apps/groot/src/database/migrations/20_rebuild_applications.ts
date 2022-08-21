import { ApplicationV4, ApplicationV5 } from '@edgelabs/types';
import { ScylloClient } from 'scyllo';

import { log } from '../../util/logging';
import { Migration } from '../migrations';

const createTable = async (
    database: ScylloClient<{
        applications: ApplicationV5;
    }>,
    table_name: string
) => {
    await database.createTable(
        table_name as 'applications',
        true,
        {
            app_id: {
                type: 'bigint',
            },
            domain_id: {
                type: 'bigint',
            },
            last_deployed: {
                type: 'timestamp',
            },
            name: {
                type: 'text',
            },
            owner_id: {
                type: 'bigint',
            },
        },
        'owner_id',
        ['app_id']
    );
};

export const rebuild_applications: Migration<{
    applications: ApplicationV4;
    applications_tmp: ApplicationV5;
}> = async (database) => {
    log.debug('creating table');
    await createTable(database, 'applications_tmp');

    log.debug('getting ol');
    const applications_from_old = await database.selectFrom('applications', [
        'app_id',
    ]);

    for (const application of applications_from_old) {
        const deploymentData = await database.selectOneFrom(
            'applications',
            '*',
            { app_id: application.app_id }
        );

        await database.insertInto('applications_tmp', {
            app_id: deploymentData?.app_id,
            domain_id: deploymentData?.domain_id,
            last_deployed: deploymentData?.last_deployed,
            name: deploymentData?.name,
            owner_id: deploymentData?.owner_id,
        });
    }

    // await database.raw('drop index applications_by_name');
    await database.raw('drop index applications_owner_id_idx');

    await database.dropTable('applications');

    await createTable(database, 'applications');

    await database.createIndex('applications', 'applications_by_name', 'name');
    // await database.createIndex('applications', '', 'owner_id');

    const applications_form_intermediary = await database.selectFrom(
        'applications_tmp',
        ['app_id']
    );

    for (const application of applications_form_intermediary) {
        const applicationData = await database.selectOneFrom(
            'applications_tmp',
            '*',
            {
                app_id: application.app_id,
            }
        );

        await (
            database as ScylloClient<{ applications: ApplicationV5 }>
        ).insertInto('applications', applicationData as ApplicationV5);
    }

    await database.dropTable('applications_tmp');

    await database.raw(
        'CREATE MATERIALIZED VIEW applications_by_user AS select * from applications where owner_id IS NOT NULL and last_deployed IS NOT NULL and app_id IS NOT NULL PRIMARY KEY (owner_id, last_deployed, app_id);'
    );
};
