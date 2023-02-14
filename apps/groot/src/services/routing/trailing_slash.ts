import { RoutingConfig } from '@edgelabs/types';
import { extname } from 'node:path';

export const shouldSlashRedirect = (
    config: RoutingConfig,
    path_url: string
): string | undefined => {
    // ignore query parameters
    const [path_url_no_query, query] = path_url.split('?');

    let newUrl: string | undefined;

    if (!path_url_no_query) return undefined;

    const extension = extname(path_url_no_query);

    if (extension) return undefined;

    if (config.trailing_slash === 'always') {
        if (path_url_no_query.endsWith('/')) return undefined;

        newUrl = path_url_no_query + '/';
    } else if (config.trailing_slash === 'never') {
        if (!path_url_no_query.endsWith('/')) return undefined;

        newUrl = path_url_no_query.slice(0, -1);
    } else 
        return undefined;
    

    if (query) 
        newUrl += '?' + query;

    return newUrl;
};
