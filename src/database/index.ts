import { ScylloClient } from 'scyllo';

import { Globals } from '..';
import { AuthKeyV1 } from '../types/AuthKey.type';
import { OwnerV1 } from '../types/Owner.type';
import { SiteV1 } from '../types/Site.type';
import { log } from '../util/logging';
import { migrate, Migrations, MigrationState } from './migrations';

type DBType = {
    // Get a list of all the owners by OwnerID
    owners: OwnerV1;
    // Get a list of all the sites
    sites: SiteV1;
    // Get authorization
    keys: AuthKeyV1;
    // Get authorization
    migrations: MigrationState;
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
