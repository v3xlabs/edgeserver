import { EMPTY_PERMISSIONS, grantPermission } from 'permissio';

import { AuthKeyV4 } from '../../types/AuthKey.type';
import { KeyPerms } from '../../util/permissions';
import { Migration } from '../migrations';

export const keys_perms_bigint: Migration<{ keys: AuthKeyV4 }> = async (
    database
) => {
    await database.raw('alter table keys drop permissions');
    await database.raw('alter table keys add permissions bigint');

    const keys = await database.selectFrom('keys', ['key']);

    const fullPerm = grantPermission(EMPTY_PERMISSIONS, KeyPerms.FULL);

    for (const key of keys) {
        await database.update(
            'keys',
            { permissions: fullPerm },
            { key: key.key }
        );
    }
};
