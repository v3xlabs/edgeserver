import { createClient } from 'redis';

export const CACHE = createClient({});

(async () => {
    await CACHE.connect();
})();

export const getCache = async () => {
    if (!CACHE.isOpen) {
        await CACHE.connect();
    }

    return CACHE;
};
