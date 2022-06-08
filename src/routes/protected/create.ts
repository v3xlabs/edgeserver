import { addBreadcrumb } from '@sentry/node';
import { FastifyPluginAsync } from 'fastify';
import Multipart from 'fastify-multipart';
import { rm } from 'node:fs/promises';
import { join } from 'node:path';
import { generateSunflake } from 'sunflake';
import { Extract } from 'unzipper';
import { string } from 'yup';

import { StorageBackend } from '../..';
import { DB } from '../../database';
import { useAPIToken } from '../../util/http/useAPIToken';
import { log } from '../../util/logging';
import { startAction } from '../../util/sentry/createChild';
import { sentryHandle } from '../../util/sentry/sentryHandle';

const generateSnowflake = generateSunflake();

export const CreateRoute: FastifyPluginAsync = async (router, options) => {
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

    router.put<
        typeof options & {
            Querystring: {
                site: string;
                comment?: string;
                git_sha?: string;
                git_src?: string;
                git_type?: string;
                git_actor?: string;
            };
        }
    >(
        '/push',
        {
            schema: {
                querystring: {
                    type: 'object',
                    properties: { site: { type: 'string' } },
                    required: ['site'],
                },
                headers: {
                    type: 'object',
                    properties: { authorization: { type: 'string' } },
                    required: ['authorization'],
                },
            },
        },
        (request, reply) => {
            handle(request, reply, async (transaction, registerCleanup) => {
                // Check auth
                const auth = await useAPIToken(request, reply);

                if (typeof auth !== 'string') {
                    return auth;
                }

                // Do the rest
                const data = await request.file();
                const temporary_name = generateSnowflake();

                const site = await startAction(
                    transaction,
                    {
                        op: 'getAppById',
                    },
                    async () => {
                        return await DB.selectOneFrom(
                            'applications',
                            ['app_id'],
                            {
                                app_id: request.query.site,
                            }
                        );
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

                const deploy_id = generateSnowflake();

                await startAction(
                    transaction,
                    {
                        op: 'Update DB',
                    },
                    async () => {
                        await DB.insertInto('deployments', {
                            app_id: site.app_id,
                            cid: '',
                            deploy_id,
                            sid: bucket_name,
                        });
                        const { domain_id } = (await DB.selectOneFrom(
                            'applications',
                            ['domain_id'],
                            { app_id: site.app_id }
                        ))!;

                        const domain = await DB.selectOneFrom(
                            'domains',
                            ['domain'],
                            { domain_id }
                        );

                        await DB.update(
                            'applications',
                            { last_deployed: new Date().toString() },
                            {
                                app_id: site.app_id,
                            }
                        );

                        if (domain) {
                            await DB.insertInto('dlt', {
                                app_id: site.app_id,
                                base_url: domain.domain,
                                deploy_id,
                            });
                        }
                    }
                );

                return {
                    status: 200,
                    logMessages: [
                        'Successfully uploaded site',
                        'SiteID: ' + site.app_id,
                        'Bucket: ' + bucket_name,
                    ],
                };
            });
        }
    );
};
