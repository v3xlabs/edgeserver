import { extname } from 'node:path';

import { RoutingConfig } from '../../types/ConfigFile.type';

export const shouldSlashRedirect = (
    config: RoutingConfig,
    path_url: string
): string | undefined => {
    // ignore query parameters
    const path_url_no_query = path_url.split('?').at(0);

    if (!path_url_no_query) return undefined;

    const extension = extname(path_url_no_query);

    if (extension) return undefined;

    if (config.trailing_slash === 'true') {
        if (path_url_no_query.endsWith('/')) {
            return undefined;
        }

        return path_url_no_query + '/';
    }

    if (config.trailing_slash === 'false') {
        if (!path_url_no_query.endsWith('/')) {
            return undefined;
        }

        return path_url_no_query.slice(0, -1);
    }

    return undefined;
};
