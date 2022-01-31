import { FastifyPluginAsync } from 'fastify';
import { createReadStream } from 'node:fs';
import { join } from 'node:path';
import { normalize } from 'node:path';
import { forEachChild } from 'typescript';

import { StorageBackend } from '..';
import { DB } from '../database';
import { Site } from '../types/Site.type';
import { getCache, updateCache } from '../util/cache/cache';
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
        handle(request, reply, async (transaction) => {
            transaction.setTag('signal-ip', request.ip);
            const path = normalize(request.url);

            log.network(
                'Incomming request at ' + request.hostname + ' ' + request.url
            );

            const site_data = await startAction(
                transaction,
                {
                    op: 'getSiteByID',
                    description: 'Getting site by site id',
                },
                async (child) => {
                    child.setTag('host', request.hostname);

                    const cachedSite = getCache<Pick<Site, 'site_id' | 'cid'>>(
                        'site_' + request.hostname
                    );

                    child.setTag('cached_cid', !!cachedSite);

                    if (cachedSite) {
                        log.ok('Loading from cache');

                        return cachedSite;
                    }

                    const liveSite = await DB.selectOneFrom(
                        'sites',
                        ['site_id', 'cid'],
                        {
                            host: request.hostname,
                        }
                    );

                    updateCache('site_' + request.hostname, liveSite, 60_000);

                    return liveSite;
                }
            );

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

            /* Set the path but try cached first if we can */
            const cachedPath = getCache<string>(
                'resolve_' + site_data.cid + '_' + request.url
            );

            /* Update the cachedPath in report */
            transaction.setTag('cached', !!cachedPath);
            transaction.setTag('cached_path', cachedPath);

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
                reply.header('Cache-Control', 'max-age=60');
                reply.type(directPageData.type);
                reply.send(directPageData.stream);

                return;
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
        });
    });
};
