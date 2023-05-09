import { TeamV2, UserDataV1 } from '@edgelabs/types';

import { Migration } from '../migrations.js';

export const create_user_membership: Migration<{
    users: UserDataV1;
    teams: TeamV2;
}> = async (database, log) => {
    log('Ensuring Tables');

    await database.raw('ALTER TABLE teams ADD members set<text>;');

    await database.createTable(
        'users',
        true,
        {
            user_id: {
                type: 'text',
            },
            teams: {
                type: 'set<bigint>',
            },
        },
        'user_id'
    );
};
