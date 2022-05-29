import { Transaction } from '@sentry/types';
import { FastifyPluginAsync } from 'fastify';
import { createReadStream } from 'node:fs';
import { join } from 'node:path';
import { normalize } from 'node:path';

import { StorageBackend } from '..';
import { DB } from '../database';
import { Site } from '../types/Site.type';
import { getCache, updateCache } from '../util/cache/cache';
import { informationWrap } from '../util/http/information_wrapper';
import { log } from '../util/logging';
import { startAction } from '../util/sentry/createChild';
import { sentryHandle } from '../util/sentry/sentryHandle';

export const GenericRoute: FastifyPluginAsync<{}> = async (router) => {
    const handle = sentryHandle({
        transactionData: {
            name: 'GenericRoute',
        },
        dataConsent: {
            ip: true,
            request: true,
            serverName: true,
            transaction: true,
            user: true,
            version: true,
        },
    });

    router.get('*', (request, reply) => {
        handle(
            request,
            reply,
            informationWrap(async (information, transaction: Transaction) => {
                transaction.setTag('signal-ip', request.ip);
                information.domain = request.hostname;

                const { pathname } = new URL('http://ignore' + request.url);

                information.endpoint = pathname;

                const path = normalize(pathname);

                const site_data = await startAction(
                    transaction,
                    {
                        op: 'getSiteByID',
                        description: 'Getting site by site id',
                    },
                    async (child) => {
                        child.setTag('host', request.hostname);

                        const cachedSite = getCache<
                            Pick<Site, 'site_id' | 'cid'>
                        >('site_' + request.hostname);

                        child.setTag('cached_cid', !!cachedSite);
                        information.info_source = cachedSite
                            ? 'cached'
                            : 'live';

                        if (cachedSite) return cachedSite;

                        const liveSite = await DB.selectOneFrom(
                            'sites',
                            ['site_id', 'cid'],
                            {
                                host: request.hostname,
                            }
                        );

                        updateCache(
                            'site_' + request.hostname,
                            liveSite,
                            60_000
                        );

                        return liveSite;
                    }
                );

                log.debug('site_data', { site_data });

                /* If site does not exist, send 404 */
                if (!site_data) {
                    reply.type('html');
                    reply.send(
                        createReadStream(join(__dirname, '../static/404.html'))
                    );

                    return;
                }

                /* Update the bucket name in report */
                transaction.setTag('bucket_name', site_data.cid);
                information.cid = site_data.cid;

                /* Set the path but try cached first if we can */
                const cachedPath = getCache<string>(
                    'resolve_' + site_data.cid + '_' + path
                );

                /* Update the cachedPath in report */
                transaction.setTag('cached', !!cachedPath);
                transaction.setTag('cached_path', cachedPath);
                information.data_source = cachedPath ? 'cached' : 'live';

                if (cachedPath) {
                    /* Load direct page data */
                    const cachedPageData = await startAction(
                        transaction,
                        { op: 'Loading cached file' },
                        async () => {
                            return await StorageBackend.get(
                                site_data.cid,
                                cachedPath
                            );
                        }
                    );

                    if (cachedPageData) {
                        transaction.setTag('resolved-by', 'cached-path');
                        information.resolved_path = cachedPath;
                        information.success = true;

                        reply.header('Cache-Control', 'max-age=60');
                        reply.type(cachedPageData.type);
                        reply.send(cachedPageData.stream);

                        return;
                    }
                }

                /* Load direct page data */
                const directPageData = await startAction(
                    transaction,
                    { op: 'Loading direct file' },
                    async () => {
                        return await StorageBackend.get(site_data.cid, path);
                    }
                );

                if (directPageData) {
                    transaction.setTag('resolved-by', 'direct');
                    information.resolved_path = path;
                    information.success = true;

                    reply.header('Cache-Control', 'max-age=60');
                    reply.type(directPageData.type);
                    reply.send(directPageData.stream);

                    return;
                }

                /* Load direct html page data */
                if (!/\..*$/.test(path)) {
                    const directHtmlPageData = await startAction(
                        transaction,
                        { op: 'Loading direct file' },
                        async () => {
                            return await StorageBackend.get(
                                site_data.cid,
                                path + '.html'
                            );
                        }
                    );

                    if (directHtmlPageData) {
                        transaction.setTag('resolved-by', 'direct-html');
                        information.resolved_path = path + '.html';
                        information.success = true;

                        reply.header('Cache-Control', 'max-age=60');
                        reply.type(directHtmlPageData.type);
                        reply.send(directHtmlPageData.stream);

                        return;
                    }
                }

                const indexPageData = await startAction(
                    transaction,
                    { op: 'Loading page data' },
                    async () => {
                        return await StorageBackend.traverse(
                            site_data.cid,
                            join(path, '.')
                        );
                    }
                );

                if (indexPageData) {
                    transaction.setTag('resolved-by', 'traverse');
                    information.resolved_path = indexPageData.path;
                    information.success = true;

                    /* Store the resolved path in memory */
                    updateCache(
                        'resolve_' + site_data.cid + '_' + path,
                        indexPageData.path,
                        60_000
                    );

                    reply.header('Cache-Control', 'max-age=60');
                    reply.type(indexPageData.file.type);
                    reply.send(indexPageData.file.stream);

                    return;
                }

                reply.send(site_data);
            })
        );
    });
};
