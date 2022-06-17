type trailSlash = 'true' | 'false' | 'auto';
type Snowflake = string;

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

export type Rewrite = {
    source: string;
    destination: string;
    has: {
        type: 'header' | 'cookie' | 'host' | 'query';
        key: string;
        value?: string;
    };
};

export type Redirect = {
    source: string;
    destination: string;
    permanent: boolean;
    has: {
        type: 'header' | 'cookie' | 'host' | 'query';
        key: string;
        value?: string;
    }[];
};

export type EdgeRcConfig = {
    routing: {
        file_extensions: boolean;
        trailing_slash: trailSlash;
    };

    headers: Header[];
    redirects: Redirect[];
    rewrites: Rewrite[];

    ssl: boolean;
};

export type Edgerc = {
    app_id: Snowflake;
    config: EdgeRcConfig;
};
