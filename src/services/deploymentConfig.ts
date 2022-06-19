import { DB } from '../database';
import { defaultEdgeRcConfig, EdgeRcConfig } from '../types/ConfigFile.type';
import { useData } from '../util/useData';

const getConfigFromRedis =
    (base_url: string) => async (): Promise<EdgeRcConfig | undefined> => {
        // TODO get config from redis
        return undefined;
    };

const getConfigFromBaseDB =
    (deploy_id: string) => async (): Promise<EdgeRcConfig | undefined> => {
        const data = await DB.selectOneFrom('deployment_configs', ['config'], {
            deploy_id,
        });

        // TODO validate config
        return data ? (JSON.parse(data.config) as EdgeRcConfig) : undefined;
    };

export const getConfig = async (deploy_id: string) => {
    return (
        (await useData<EdgeRcConfig>(
            'config_' + deploy_id,
            getConfigFromRedis(deploy_id),
            getConfigFromBaseDB(deploy_id)
        )) || defaultEdgeRcConfig
    );
};
