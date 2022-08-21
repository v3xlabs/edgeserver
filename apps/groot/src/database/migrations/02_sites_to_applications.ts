import { ApplicationV1, SiteV1 } from '@edgelabs/types';

import { Migration } from '../migrations';

export const sites_to_applications: Migration<{
    sites: SiteV1;
    applications: ApplicationV1;
}> = async (database) => {
    const sites = await database.selectFrom('sites', '*');

    for (const site of sites) {
        await database.insertInto('applications', {
            app_id: site.site_id,
            owner_id: site.owner,
        });
    }
};
