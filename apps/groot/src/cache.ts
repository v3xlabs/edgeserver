import { createClient } from 'redis';

import { Globals } from '.';

export const CACHE = createClient({
    url: Globals.REDIS_IP,
});

(async () => {
    await CACHE.connect();
})();

export const getCache = async () => {
    if (!CACHE.isOpen) await CACHE.connect();

    return CACHE;
};
