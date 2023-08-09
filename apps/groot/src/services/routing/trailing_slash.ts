import { RoutingConfig } from '@edgelabs/types';
import { extname } from 'node:path';

import { log } from '../../util/logging';

/**
 * Warning expirimental
 */
export const shouldSlashRedirect = (
    config: RoutingConfig,
    path_url: string,
): string | undefined => {
    // ignore query parameters
    const path_url_no_query = path_url.split('?').at(0);

    log.debug({ path_url_no_query });

    if (!path_url_no_query) return undefined;

    const extension = extname(path_url_no_query);

    log.debug({ path_url_no_query, extension });

    if (extension) return undefined;

    if (!path_url_no_query.endsWith('/')) return undefined;

    return path_url_no_query.slice(0, -1);
};
