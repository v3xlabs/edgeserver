import { generateSnowflake } from '../../routes/api';
import { ApplicationV2 } from '../../types/Application.type';
import { DomainV1 } from '../../types/Domain.type';
import { SiteV1 } from '../../types/Site.type';
import { Migration } from '../migrations';

export const sites_domain: Migration<{
    applications: ApplicationV2;
    sites: SiteV1;
    domains: DomainV1;
}> = async (database) => {
    const sites = await database.selectFrom('sites', [
        'site_id',
        'host',
        'owner',
    ]);

    for (const site of sites) {
        const domain: Partial<DomainV1> = {
            domain_id: BigInt(generateSnowflake()),
            domain: site.host,
            user_id: site.owner,
        };

        database.insertInto('domains', domain);

        const application: Partial<ApplicationV2> = {
            app_id: site.site_id,
            domain_id: domain.domain_id,
            owner_id: site.owner,
        };

        database.insertInto('applications', application);
    }
};
