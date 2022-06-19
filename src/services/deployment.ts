import { DB } from '../database';
import { useLocalCache } from '../util/cache/localCache';
import { useRedisCache } from '../util/cache/redisCache';
import { useCache } from '../util/useData';
import { Resolver } from '../util/useData';

export const getDeploymentData = async (deployment_id: string) => {
    return useCache<{ sid: string }>(
        'deployment_' + deployment_id,
        useLocalCache(),
        useRedisCache(),
        (async () => {
            const data = await DB.selectOneFrom('deployments', ['sid'], {
                deploy_id: deployment_id,
            });

            if (!data) return;

            return data;
        }) as Resolver<{ sid: string }>
    );
};
