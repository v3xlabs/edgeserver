// export type Permissions = {
//     version: '1';
//     full_access?: boolean;

//     app_read?: boolean;
//     app_write?: boolean;
//     app_remove?: boolean;

//     create_domain?: boolean;
//     remove_domain?: boolean;

//     deploy_app?: boolean;
// };

export enum Permissions {
    full_access = '-1',

    app_read = '11',
    app_write = '12',
    app_delete = '13',

    domains_read = '21',
    domains_write = '22',
    domains_delete = '23',

    deployments_read = '31',
    deployments_write = '32',
}

export type PermissionsString = string;

export const hasPermission = (
    permissions: string,
    ...permissionsToCheck: Permissions[]
) => {
    const perms = permissions.split(',');

    return (
        perms.includes(Permissions.full_access) ||
        permissionsToCheck.every((permission) => perms.includes(permission))
    );
};

// hasPermission({ create: { app: true } }, );

/// TODO:
// @ts-ignore
export const getFullPermissions = (): Permissions[] => [
    Permissions.full_access,
];

/// TODO:
export const serializePermissions = (permissions: Permissions[]): string => {
    return permissions.join(',');
};
// Oof

// This random chinese guy is a lunatic and tryna claim 'web3://' as his EIPs schema rofl.
// And his thing is not decentralized, doesnt match w half the pre-existing specs, and we are all here just like "lol wtf, this guy forreal?!?"

// const steve = new AccessControl();

// steve.grant('app').create('resource').delete('resource');

// log.debug(steve.getGrants());
