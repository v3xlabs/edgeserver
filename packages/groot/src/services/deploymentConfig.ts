import { DB } from '../database';
import { defaultEdgeRcConfig, RoutingConfig } from '../types/ConfigFile.type';
import { useData } from '../util/useData';

const getRoutingConfigFromRedis =
    (base_url: bigint) => async (): Promise<RoutingConfig | undefined> => {
        // TODO get config from redis
        return undefined;
    };

const getRoutingConfigFromBaseDB =
    (deploy_id: bigint) => async (): Promise<RoutingConfig | undefined> => {
        const data = await DB.selectOneFrom('deployment_configs', ['routing'], {
            deploy_id,
        });

        // TODO validate config
        return data ? (JSON.parse(data.routing) as RoutingConfig) : undefined;
    };

export const getRoutingConfig = async (deploy_id: bigint) => {
    return {
        ...defaultEdgeRcConfig.routing,
        ...(await useData<RoutingConfig>(
            'config_' + deploy_id,
            getRoutingConfigFromRedis(deploy_id),
            getRoutingConfigFromBaseDB(deploy_id)
        )),
    };
};
