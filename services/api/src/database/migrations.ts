import { ScylloClient, TableScheme } from 'scyllo';

import { log } from '../utils/logger.js';
import { DB } from './index.js';
import { initial_create } from './migrations/00_initial_create.js';
import { create_deployments } from './migrations/01_create_deployments.js';
import { create_user_membership } from './migrations/02_create_user_membership.js';
import { create_domains } from './migrations/03_create_domains.js';
import { create_deployment_data } from './migrations/04_create_deployment_data.js';

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
    migrations: Migration<TableScheme>[]
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
        current_version: '0',
    };

    log.info(
        'Current Migration: #' +
            (-1 + Number.parseInt(current_version)).toString()
    );

    let index = +current_version;
    let migrations_run = 0;

    while (index < migrations.length) {
        log.info('Running Migration ' + index);
        await migrations[index](database, (log_text) =>
            log.info('M-' + index + ': ' + log_text)
        );
        migrations_run += 1;
        index += 1;
        await database.insertInto('migrations', {
            instance_id: '1',
            current_version: index.toString(),
        });
    }

    if (migrations_run == 0)
        log.info('No Migrations had to be run, everything up-to-date!');
    else log.info(`Finished ${migrations_run} Migrations`);
};

export const Migrations: Migration<TableScheme>[] = [
    // Create Initial Database
    initial_create,
    // Create Deployments Table
    create_deployments,
    // Create User Membership
    create_user_membership,
    // Create Domains
    create_domains,
    // Create Deployment Data
    create_deployment_data,
];
