import { ApplicationV1 } from '@edgelabs/types';

import { Migration } from '../migrations';

export const applications_create: Migration<{
    applications: ApplicationV1;
}> = async (database) => {
    await database.createTable(
        'applications',
        true,
        {
            app_id: {
                type: 'bigint',
            },
            owner_id: {
                type: 'bigint',
            },
            permissions: {
                type: 'map',
                keyType: 'bigint', // User ID
                valueType: 'bigint', // PermissionsBit
            },
        },
        'app_id'
    );
};
