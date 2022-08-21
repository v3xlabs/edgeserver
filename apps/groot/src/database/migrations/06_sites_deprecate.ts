import { ApplicationV1, DeploymentLookupV1, DeploymentV2, DomainV1, SiteV1 } from '@edgelabs/types';

import { generateSnowflake } from '../../routes/api';
import { Migration } from '../migrations';

export const sites_deprecate: Migration<{
    domains: DomainV1;
    sites: SiteV1;
    applications: ApplicationV1;
    deployments: DeploymentV2;
    dlt: DeploymentLookupV1;
}> = async (database) => {
    const sites = await database.selectFrom('sites', '*');

    for (const site of sites) {
        const deployment: DeploymentV2 = {
            deploy_id: BigInt(generateSnowflake()),
            app_id: site.site_id,
            timestamp: new Date().toString(),
            cid: '',
            sid: site.cid,
        };

        await database.insertInto('deployments', deployment);

        const deploymentLink: DeploymentLookupV1 = {
            app_id: site.site_id,
            deploy_id: deployment.deploy_id,
            base_url: site.host,
        };

        await database.insertInto('dlt', deploymentLink);
    }
};
