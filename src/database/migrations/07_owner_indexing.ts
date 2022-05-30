import { ApplicationV1 } from '../../types/Application.type';
import { DeploymentV2 } from '../../types/Deployment.type';
import { DomainV1 } from '../../types/Domain.type';
import { Migration } from '../migrations';

export const owner_indexing: Migration<{
    domains: DomainV1;
    applications: ApplicationV1;
    deployments: DeploymentV2;
}> = async (database) => {
    await database.createIndex('applications', '', 'owner_id');
    await database.createIndex(
        'deployments',
        'deployments_by_app_id',
        'app_id'
    );
    await database.createIndex('domains', 'domains_by_owner_id', 'user_id');
};
