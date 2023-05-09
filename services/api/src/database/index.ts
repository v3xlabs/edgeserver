import { Domain, Site, Team, Token, UserData } from '@edgelabs/types';
import { Deployment } from '@edgelabs/types';
import { ScylloClient } from 'scyllo';

import { log } from '../utils/logger.js';
import { migrate, Migrations, MigrationState } from './migrations.js';

type DBType = {
    migrations: MigrationState;
    teams: Team;
    sites: Site;
    deployments: Deployment;
    tokens: Token;
    users: UserData;
    domains: Domain;
};

export let DB: ScylloClient<DBType>;

export const initDB = async () => {
    DB = new ScylloClient<DBType>({
        client: {
            contactPoints: [process.env.DB_IP || 'localhost:9042'],
            localDataCenter: process.env.DB_DATACENTER || 'datacenter1',
            keyspace: 'system',
            encoding: {
                useBigIntAsLong: true,
            },
        },
        debug: (process.env.DEBUG || '').toLowerCase() == 'true' || false,
    });

    log.info('Awaiting DB Connection');
    await DB.awaitConnection();

    await DB.useKeyspace('edgeserver', true);

    await migrate(DB, Migrations);
};
