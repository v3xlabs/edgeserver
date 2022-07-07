/***
 * Long lived keys should be stored in DB
 * Expiring Keys should be stored in redis
 */

import { CACHE } from '../../cache';
import { DB } from '../../database';
import { generateSnowflake } from '../../routes/api';
import { AuthKey, RedisAuthKey } from '../../types/AuthKey.type';
import { PermissionsString } from './permissions';

export const getAuthKeys = async (user_id: string) => {
    const [DBKey, RedisKey] = await Promise.allSettled([
        DB.selectFrom('keys', '*', { owner_id: user_id }),
        CACHE.LRANGE(`keys_${user_id}`, 0, -1),
    ]);

    const resultList: AuthKey[] = [];

    if (DBKey.status == 'fulfilled' && DBKey.value) {
        // log.debug('All Keys, Found ' + DBKey.value.length + ' in Scylla');
        resultList.push(...DBKey.value);
    }

    if (RedisKey.status == 'fulfilled' && RedisKey.value) {
        // log.debug('All Keys, Found ' + RedisKey.value + ' in Redis');
        const rediskeys = await Promise.allSettled(
            RedisKey.value.map(async (key_id) => {
                const key_data = await CACHE.GET(`keys_${user_id}_${key_id}`);

                if (key_data) return JSON.parse(key_data) as AuthKey;
            })
        );

        const _redisKeys = rediskeys.filter(
            (redisKeyRequest) =>
                redisKeyRequest.status === 'fulfilled' && redisKeyRequest.value
        ) as unknown as PromiseFulfilledResult<AuthKey>[];

        resultList.push(
            ..._redisKeys.map((redisKeyRequest) => redisKeyRequest.value)
        );
    }

    return resultList;
};

export const getAuthKey = async (
    key_id: string,
    user_id: string
): Promise<AuthKey | undefined> => {
    const [DBKey, RedisKey] = await Promise.allSettled([
        DB.selectOneFrom('keys', '*', { key: key_id, owner_id: user_id }),
        CACHE.GET(`keys_${user_id}_${key_id}`),
    ]);

    if (DBKey.status == 'fulfilled' && DBKey.value) return DBKey.value;

    if (RedisKey.status == 'fulfilled' && RedisKey.value)
        return JSON.parse(RedisKey.value);
};

export const createExpiringAuthKey = async (
    user_id: string,
    permissions: PermissionsString,
    name: string,
    last_use_data: string,
    expiresAt: number
) => {
    const key: RedisAuthKey = {
        key: generateSnowflake(),
        last_use: 0,
        owner_id: user_id,
        permissions,
        state: 1,
        exp: expiresAt.toString(),
        name,
        last_use_data,
    };

    await CACHE.set(
        `keys_${key.owner_id.toString()}_${key.key}`,
        JSON.stringify(key),
        {
            EXAT: Number.parseInt(
                expiresAt
                    .toString()
                    .slice(0, Math.max(0, expiresAt.toString().length - 3))
            ),
        }
    );

    await CACHE.lPush(`keys_${key.owner_id.toString()}`, key.key);
    // CACHE.LREM(`keys_${key.owner_id}`, -1, key.key);

    return key;
};

export const createLongLivedAuthKey = async (
    user_id: string,
    permissions: PermissionsString,
    name: string
) => {
    const key: AuthKey = {
        key: generateSnowflake(),
        last_use: 0,
        owner_id: user_id,
        permissions,
        state: 1,
        name,
        last_use_data: '',
    };

    await DB.insertInto('keys', key);

    return key;
};

export const brutalDeleteKey = async (key: string, user_id: string) => {
    await Promise.all([
        CACHE.DEL(`keys_${user_id}_${key}`),
        CACHE.LREM(`keys_${user_id}`, -1, key),
        DB.deleteFrom('keys', '*', { key: key }),
    ]);
};

export const updateExpiringLastUsed = async (key: string, owner_id: string) => {
    const data = await CACHE.get(`keys_${owner_id}_${key}`);

    if (!data) return;

    const parsedData = JSON.parse(data) as RedisAuthKey;

    parsedData.last_use = Date.now();

    await CACHE.set(`keys_${owner_id}_${key}`, JSON.stringify(parsedData));
};

export const updateLongLivedLastUsed = async (key: string) => {
    await DB.update('keys', { last_use: Date.now() }, { key });
};
