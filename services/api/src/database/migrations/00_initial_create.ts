import { SiteV1, TeamV1, TokenV1 } from '@edgelabs/types';

import { Migration } from '../migrations.js';

export const initial_create: Migration<{
    teams: TeamV1;
    sites: SiteV1;
    tokens: TokenV1;
}> = async (database, log) => {
    log('Ensuring Tables');
    await database.createTable(
        'teams',
        true,
        {
            team_id: {
                type: 'bigint',
            },
            owner: {
                type: 'blob',
            },
            name: {
                type: 'text',
            },
            type: {
                type: 'tinyint',
            },
            icon: {
                type: 'blob',
            },
        },
        'team_id'
    );
    await database.createIndex('teams', 'teams_by_owner', 'owner');

    await database.createTable(
        'sites',
        true,
        {
            site_id: {
                type: 'bigint',
            },
            team_id: {
                type: 'bigint',
            },
            name: {
                type: 'text',
            },
            last_deploy_id: {
                type: 'bigint',
            },
        },
        'site_id'
    );
    await database.createIndex('sites', 'sites_by_team_id', 'team_id');

    await database.createTable(
        'tokens',
        true,
        {
            token_id: {
                type: 'text',
            },
            team_id: {
                type: 'bigint',
            },
            name: {
                type: 'text',
            },
            revoked_at: {
                type: 'timestamp',
            },
            permissions: {
                type: 'bigint',
            },
            site_id: {
                type: 'bigint',
            },
        },
        ['team_id', 'token_id']
    );
    await database.createIndex('tokens', 'tokens_by_team_id', 'team_id');
    await database.createIndex('tokens', 'tokens_by_site_id', 'site_id');
    await database.createIndex('tokens', 'tokens_by_token_id', 'token_id');
};
