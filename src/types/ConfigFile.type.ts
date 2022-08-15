export type trailSlash = 'always' | 'never' | 'auto';

export type GenericRule = {
    pattern: string;
};
export type Condition = {
    type: 'header' | 'cookie' | 'host' | 'query';
    key: string;
    value?: string;
};

export type HeaderRule = GenericRule & {
    // Conditions that need to be true in order for the rule to apply
    conditions?: Condition[];
    // Headers to add when the rule is applied
    headers: Record<string, string>;
};

export type RewriteRule = GenericRule & {
    // Conditions that need to be true in order for the rule to apply
    conditions?: Condition[];
    destination: string;
};
export type RedirectRule = GenericRule & {
    // Conditions that need to be true in order for the rule to apply
    conditions?: Condition[];
    status: 301 | 302 | 307;
    destination: string;
};

export type RoutingConfig = {
    file_extensions?: boolean;
    trailing_slash?: trailSlash;

    default_route?: string;
};

export type EdgeRcConfig = {
    routing?: RoutingConfig;

    headers?: HeaderRule[];
    redirects?: RedirectRule[];
    rewrites?: RewriteRule[];

    ssl?: boolean;
};

export const defaultEdgeRcConfig: EdgeRcConfig = {
    routing: {
        file_extensions: true,
        trailing_slash: 'always',

        default_route: '/index.html',
    },
    headers: [],
    redirects: [],
    rewrites: [],
    ssl: true,
};

export type Edgerc = {
    app_id: string;
    config: EdgeRcConfig;
};
