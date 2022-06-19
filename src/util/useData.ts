import { cache } from './cache/localCache';

export const useData = async <K>(
    key: string,
    ...resolverFunctions: ((
        key: string
    ) => Promise<K | undefined> | K | undefined)[]
): Promise<K | undefined> => {
    let data = cache.get<K | undefined>(key);

    if (data === undefined) {
        for (const resolverFunction of resolverFunctions) {
            data = await resolverFunction(key);

            if (data !== undefined) {
                break;
            }
        }
    }

    if (data !== undefined) {
        cache.set(key, data);
    }

    return data;
};

export type Setter<K> = <K>(key: string, value: K) => void;
export type Resolver<K> = <K>(
    key: string
) => Promise<K | undefined> | K | undefined;
export type ResolverSetter<K> = {
    resolver: Resolver<K>;
    setter: Setter<K> | undefined;
};

export const useCache = async <K>(
    key: string,
    ...functions: (ResolverSetter<K> | Resolver<K>)[]
): Promise<K | undefined> => {
    let data;
    const setters: Setter<K>[] = [];

    for (const ResolverData of functions) {
        const { resolver, setter = () => {} } =
            typeof ResolverData == 'function'
                ? { resolver: ResolverData }
                : ResolverData;

        data = await resolver(key);

        if (data !== undefined) {
            for (const set of setters) {
                set(key, data);
            }
            break;
        }

        if (setter) {
            setters.push(setter);
        }
    }

    return data;
};
