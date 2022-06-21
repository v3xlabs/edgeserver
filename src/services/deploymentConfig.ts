import { DB } from '../database';
import { defaultEdgeRcConfig, EdgeRcConfig } from '../types/ConfigFile.type';
import { useData } from '../util/useData';

const getRoutingConfigFromRedis =
    (base_url: string) => async (): Promise<EdgeRcConfig | undefined> => {
        // TODO get config from redis
        return undefined;
    };

const getRoutingConfigFromBaseDB =
    (deploy_id: string) => async (): Promise<EdgeRcConfig | undefined> => {
        const data = await DB.selectOneFrom('deployment_configs', ['routing'], {
            deploy_id,
        });

        // TODO validate config
        return data ? (JSON.parse(data.routing) as EdgeRcConfig) : undefined;
    };

export const getRoutingConfig = async (deploy_id: string) => {
    return (
        (await useData<EdgeRcConfig>(
            'config_' + deploy_id,
            getRoutingConfigFromRedis(deploy_id),
            getRoutingConfigFromBaseDB(deploy_id)
        )) || defaultEdgeRcConfig
    );
};
