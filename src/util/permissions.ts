import { EMPTY_PERMISSIONS, grantPermission, hasPermission } from 'permissio';

import { SafeError } from './error/SafeError';

export enum KeyPerms {
    FULL,

    APPS_READ,
    APPS_WRITE,
    APPS_DELETE,

    DOMAINS_READ,
    DOMAINS_WRITE,
    DOMAINS_DELETE,

    DEPLOYMENTS_READ,
    DEPLOYMENTS_WRITE,
    DEPLOYMENTS_DELETE,

    USER_READ,
    USER_WRITE,
}

export const FullPerm = grantPermission(EMPTY_PERMISSIONS, KeyPerms.FULL);

export const usePerms = (
    permission_data: bigint,
    required_perms: KeyPerms[]
) => {
    if (hasPermission(permission_data, KeyPerms.FULL)) return;

    const missing_perm = required_perms.find(
        (perm) => !hasPermission(permission_data, perm)
    );

    if (missing_perm) throw new SafeError(403, '', 'use-perms-' + missing_perm);
};
