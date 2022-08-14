import { DB } from '../database';
import {
    HeaderRule,
    RedirectRule,
    RewriteRule,
} from '../types/ConfigFile.type';
import { useLocalCache } from '../util/cache/localCache';
import { useRedisCache } from '../util/cache/redisCache';
import { useCache, useData } from '../util/useData';

export const getHeaderRules = async (
    deploy_id: bigint,
    path: string
): Promise<HeaderRule[]> => {
    const rules = useData(`header_${deploy_id}`);

    return [];
};
export const getRedirectRules = async (
    deploy_id: bigint,
    path: string
): Promise<RedirectRule[] | undefined> =>
    await useCache<RedirectRule[]>(
        `redirect_${deploy_id}`,
        useLocalCache(),
        useRedisCache(),
        async (_key: string) => {
            const data = await DB.selectOneFrom(
                'deployment_configs',
                ['redirects'],
                { deploy_id }
            );

            if (!data) return;

            const { redirects } = data;

            return JSON.parse(redirects);
        }
    );

export const getRewriteRules = async (
    deploy_id: bigint,
    path: string
): Promise<RewriteRule[]> => {
    return [];
};

export const matchRedirects = (
    redirects: RedirectRule[],
    path: string
): RedirectRule | undefined => {
    for (const redirect of redirects) {
        if (new RegExp(redirect.pattern).test(path)) {
            return Object.assign(
                {},
                {
                    status: 302,
                },
                redirect
            );
        }
    }

    return undefined;
};
export const matchRewrites = (
    rewrites: RewriteRule[],
    path: string
): RewriteRule | undefined => {
    for (const rewrite of rewrites)
        if (new RegExp(rewrite.pattern).test(path)) return rewrite;

    return undefined;
};
