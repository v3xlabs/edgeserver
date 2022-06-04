import { ApplicationV3 } from '../../types/Application.type';
import { DomainV1 } from '../../types/Domain.type';
import { Migration } from '../migrations';

export const application_name: Migration<{
    applications: ApplicationV3;
    domains: DomainV1;
}> = async (database) => {
    const applications = await database.selectFrom('applications', [
        'domain_id',
        'app_id',
    ]);

    await database.raw('alter table applications add name text;');

    for (const app of applications) {
        const domain = await database.selectOneFrom('domains', ['domain'], {
            domain_id: app.domain_id,
        });

        if (!domain) continue;

        const name = domain.domain.replace(/\./g, '-');

        await database.update(
            'applications',
            { name },
            {
                app_id: app.app_id,
            }
        );
    }
};
