import { DB } from '../database';
import { useLocalCache } from '../util/cache/localCache';
import { useRedisCache } from '../util/cache/redisCache';
import { useCache, useData } from '../util/useData';

type GenericRule = {
    pattern: string;
};

export type Header = {
    source: string;
    headers: {
        [key: string]: string;
    }[];
    has: {
        type: 'header' | 'cookie' | 'host' | 'query';
        key: string;
        value?: string;
    }[];
};

type Condition = {
    type: 'header' | 'cookie' | 'host' | 'query';
    key: string;
    value?: string;
};

type HeaderRule = GenericRule & {
    // Conditions that need to be true in order for the rule to apply
    conditions: Condition[];
    // Headers to add when the rule is applied
    headers: Record<string, string>;
};

type RewriteRule = GenericRule & {
    // Conditions that need to be true in order for the rule to apply
    conditions: Condition[];
    destination: string;
};
type RedirectRule = GenericRule & {
    // Conditions that need to be true in order for the rule to apply
    conditions: Condition[];
    status: 301 | 302 | 307;
    destination: string;
};
type Rules = HeaderRule | RewriteRule | RedirectRule;

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
