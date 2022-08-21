import { ApplicationV4, DeploymentLookupV1, DeploymentV2, DomainV1 } from '@edgelabs/types';

import { Migration } from '../migrations';

export const application_last_deployed: Migration<{
    applications: ApplicationV4;
    deployments: DeploymentV2;
    dlt: DeploymentLookupV1;
    domains: DomainV1;
}> = async (database) => {
    await database.raw('alter table applications add last_deployed timestamp;');

    const applications = await database.selectFrom('applications', [
        'domain_id',
        'app_id',
    ]);

    for (const app of applications) {
        const domain = await database.selectOneFrom('domains', ['domain'], {
            domain_id: app.domain_id,
        });

        if (!domain) continue;

        const deploy = await database.selectOneFrom('dlt', ['deploy_id'], {
            base_url: domain.domain,
        });

        if (!deploy) continue;

        const { deploy_id } = deploy;

        const deployment = await database.selectOneFrom(
            'deployments',
            ['timestamp'],
            { deploy_id }
        );

        if (!deployment) continue;

        const { timestamp } = deployment;

        await database.update(
            'applications',
            { last_deployed: timestamp },
            {
                app_id: app.app_id,
            }
        );
    }
};
