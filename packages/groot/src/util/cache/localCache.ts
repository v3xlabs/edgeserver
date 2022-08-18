import NodeCache from 'node-cache';

import { ResolverSetter } from '../useData';

export const cache = new NodeCache({
    stdTTL: 5,
});

export const useLocalCache: <K>() => ResolverSetter<K> = () => ({
    async resolver(key) {
        const data = cache.get(key);

        if (!data) return;

        return JSON.parse(data as string);
    },
    setter(key, value) {
        cache.set(key, JSON.stringify(value));
    },
});
