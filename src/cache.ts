import { createClient } from 'redis';

export const CACHE = createClient({
    url: process.env.REDIS_IP || 'redis://127.0.0.1:6379',
});

(async () => {
    await CACHE.connect();
})();

export const getCache = async () => {
    if (!CACHE.isOpen) await CACHE.connect();

    return CACHE;
};
