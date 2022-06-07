import { ApplicationV4 } from '../../types/Application.type';
import { DeploymentV2 } from '../../types/Deployment.type';
import { DeploymentLookupV1 } from '../../types/DeploymentLookup.type';
import { DomainV1 } from '../../types/Domain.type';
import { Migration } from '../migrations';

export const application_name_index: Migration<{
    applications: ApplicationV4;
}> = async (database) => {
    await database.createIndex('applications', 'applications_by_name', 'name');
};
