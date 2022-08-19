import { Owner } from '@edgelabs/types';
import { ScylloClient } from 'scyllo';

import { Globals } from '..';
import { log } from '../util/logging';
import { migrate, Migrations, MigrationState } from './migrations';

type DBType = {
    // Get a list of all the owners by OwnerID
    owners: Owner;
    // Get authorization
    keys: AuthKey;
    // Get authorization
    migrations: MigrationState;
    // Applications
    applications: Application;
    // Deployments
    deployments: Deployment;
    // DeploymentLookups
    dlt: DeploymentLookup;
    // Domains
    domains: Domain;
    // DeploymentConfig
    deployment_configs: DeploymentConfig;
};
export let DB: ScylloClient<DBType>;

export const initDB = async () => {
    DB = new ScylloClient<DBType>({
        client: {
            contactPoints: [Globals.DB_IP || 'localhost:9042'],
            localDataCenter: Globals.DB_DATACENTER || 'datacenter1',
            keyspace: 'system',
            encoding: {
                useBigIntAsLong: true,
            },
        },
        debug: (process.env.DEBUG || '').toLowerCase() == 'true' || false,
    });

    log.database('Awaiting Connection');
    await DB.awaitConnection();

    await DB.useKeyspace('signal', true);

    await migrate(DB, Migrations);
};
