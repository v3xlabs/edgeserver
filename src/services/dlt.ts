import { DB } from '../database';
import { useData } from '../util/useData';

type SiteDataType = { deploy_id: string; app_id: string };

const getSiteDataFromRedis =
    (base_url: string) => async (): Promise<SiteDataType | undefined> => {
        return undefined;
    };
const getSiteDataFromBaseDB =
    (base_url: string) => async (): Promise<SiteDataType | undefined> => {
        return await DB.selectOneFrom('dlt', ['deploy_id', 'app_id'], {
            base_url: base_url,
        });
    };

export const getSiteData = async (base_url: string) => {
    return await useData<SiteDataType>(
        'dlt_' + base_url,
        getSiteDataFromRedis(base_url),
        getSiteDataFromBaseDB(base_url)
    );
};
