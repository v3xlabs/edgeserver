import { ApplicationV4 } from '../../types/Application.type';
import { Migration } from '../migrations';

export const application_name_index: Migration<{
    applications: ApplicationV4;
}> = async (database) => {
    await database.createIndex('applications', 'applications_by_name', 'name');
};
