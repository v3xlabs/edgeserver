import { addBreadcrumb } from '@sentry/node';
import { FastifyPluginAsync } from 'fastify';
import Multipart from 'fastify-multipart';
import { rm } from 'node:fs/promises';
import { join } from 'node:path';
import { PassThrough } from 'node:stream';
import { finished, pipeline } from 'node:stream/promises';
import { generateSunflake } from 'sunflake';
import { Entry, Extract, Parse } from 'unzipper';

import { StorageBackend } from '../..';
import { DB } from '../../database';
import { log } from '../../util/logging';
import { startAction } from '../../util/sentry/createChild';
import { sentryHandle } from '../../util/sentry/sentryHandle';

const generateSnowflake = generateSunflake();

export const CreateRoute: FastifyPluginAsync<{}> = async (router) => {
    const handle = sentryHandle({
        transactionData: {
            name: 'Upload',
            op: 'Upload',
        },
        sample: true,
        dataConsent: {
            ip: true,
            request: true,
            serverName: true,
            transaction: true,
            user: true,
            version: true,
        },
    });

    router.register(Multipart);

    router.put<{
        Querystring: {
            site: string;
        };
    }>(
        '/push',
        {
            schema: {
                querystring: {
                    type: 'object',
                    properties: { site: { type: 'string' } },
                },
            },
        },
        (request, reply) => {
            handle(request, reply, async (transaction, registerCleanup) => {
                const data = await request.file();
                const temporary_name = generateSnowflake();

                const site = await startAction(
                    transaction,
                    {
                        op: 'getSiteById',
                    },
                    async () => {
                        return await DB.selectOneFrom('sites', ['site_id'], {
                            site_id: request.query.site,
                        });
                    }
                );

                if (!site)
                    return {
                        status: 404,
                        logMessages: [
                            'Unable to find site ' + request.query.site,
                        ],
                    };

                log.ok('Downloading file...');
                addBreadcrumb({
                    message: 'Downloading file from ' + request.ip,
                });

                registerCleanup(() => {
                    rm(join('tmp', temporary_name), { recursive: true });
                });

                const strem = Extract({
                    concurrency: 10,
                    path: join('tmp', temporary_name),
                });

                // Download file and extract to path
                await startAction(
                    transaction,
                    {
                        op: 'Download & Unzip',
                    },
                    async () => {
                        data.file.pipe(strem);
                        await strem.promise();
                    }
                );

                const bucket_name = await startAction(
                    transaction,
                    {
                        op: 'Create Bucket',
                    },
                    StorageBackend.createBucket
                );

                await startAction(
                    transaction,
                    {
                        op: 'Upload Files',
                    },
                    async (span) => {
                        await StorageBackend.uploadDirectory(
                            bucket_name,
                            '/',
                            join('tmp', temporary_name),
                            span
                        );
                    }
                );

                await startAction(
                    transaction,
                    {
                        op: 'Update DB',
                    },
                    async () => {
                        await DB.update(
                            'sites',
                            {
                                cid: bucket_name,
                            },
                            { site_id: site.site_id }
                        );
                    }
                );

                return {
                    status: 200,
                    logMessages: [
                        'Successfully uploaded site',
                        'SiteID: ' + site.site_id,
                        'Bucket: ' + bucket_name,
                    ],
                };
            });
        }
    );
};