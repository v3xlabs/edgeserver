import { ScylloClient, TableScheme } from 'scyllo';

import { log } from '../util/logging';
import { DB } from '.';
import { initial_create } from './migrations/00_initial_create';
import { applications_create } from './migrations/01_applications_create';
import { sites_to_applications } from './migrations/02_sites_to_applications';
import { deployments_create } from './migrations/03_deployments_create';

export type MigrationState = {
    instance_id: string;
    current_version: string;
};

export type Migration<K extends TableScheme> = (
    database: ScylloClient<K>,
    log: (log_text: string) => void
) => Promise<void>;

export const migrate = async (
    database: typeof DB,
    migrations: Migration<undefined>[]
) => {
    await database.createTable(
        'migrations',
        true,
        {
            current_version: { type: 'text' },
            instance_id: { type: 'int' },
        },
        'instance_id'
    );
    const { current_version } = (await database.selectOneFrom(
        'migrations',
        '*',
        {
            instance_id: '1',
        }
    )) ?? {
        instance_id: '1',
        current_version: 0,
    };

    log.database('Current Migration: ' + current_version);

    for (let index = +current_version; index < migrations.length; index++) {
        log.database('Running Migration ' + index);
        await migrations[index](database, (log_text) =>
            log.database('M-' + index + ': ' + log_text)
        );
        await database.insertInto('migrations', {
            instance_id: '1',
            current_version: index.toString(),
        });
    }

    log.database('Finished Migrations');
};

export const Migrations: Migration<undefined>[] = [
    // Create Initial Database
    initial_create,
    // Create Applications Table
    applications_create,
    // Copy User Data from `sites` to `applications`
    sites_to_applications,
    // Create Deployment and DeploymentLookup Tables
    deployments_create,
];
