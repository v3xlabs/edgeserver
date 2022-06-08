import { ScylloClient } from 'scyllo';

import { Globals } from '..';
import { Application } from '../types/Application.type';
import { AuthKey } from '../types/AuthKey.type';
import { Deployment } from '../types/Deployment.type';
import { DeploymentLookup } from '../types/DeploymentLookup.type';
import { Domain } from '../types/Domain.type';
import { Owner } from '../types/Owner.type';
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
};
export let DB: ScylloClient<DBType>;

export const initDB = async () => {
    DB = new ScylloClient<DBType>({
        client: {
            contactPoints: [Globals.DB_IP || 'localhost:9042'],
            localDataCenter: Globals.DB_DATACENTER || 'datacenter1',
            keyspace: 'system',
        },
        debug: (process.env.DEBUG || '').toLowerCase() == 'true' || false,
    });

    log.database('Awaiting Connection');
    await DB.awaitConnection();

    await DB.useKeyspace('signal', true);

    await migrate(DB, Migrations);
};
