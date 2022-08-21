import { getCache } from '../../cache';
import { ResolverSetter } from '../useData';

export const useRedisCache: <K>() => ResolverSetter<K> = (expiry = 600) => ({
    async resolver<K>(key) {
        const cache = await getCache();

        if (cache && cache.isOpen) {
            const data = await cache.get(key);

            if (!data) return;

            return JSON.parse(data) as unknown as K;
        }
    },
    setter(key, value) {
        getCache().then((cache) => {
            if (cache && cache.isOpen)
                cache.set(key, JSON.stringify(value), { EX: expiry });
        });
    },
});
