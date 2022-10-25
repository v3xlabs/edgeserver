import { createClient } from 'redis';

export const CACHE = createClient({
    url: process.env.REDIS_IP,
});

(async () => {
    await CACHE.connect();
})();

export const getCache = async () => {
    if (!CACHE.isOpen) await CACHE.connect();

    return CACHE;
};
