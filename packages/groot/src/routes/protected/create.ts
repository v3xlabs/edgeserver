import Multipart from '@fastify/multipart';
import { addBreadcrumb } from '@sentry/node';
import { FastifyPluginAsync } from 'fastify';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { generateSunflake } from 'sunflake';
import { Extract } from 'unzipper';

import { StorageBackend } from '../..';
import { CACHE } from '../../cache';
import { DB } from '../../database';
import { Edgerc } from '../../types/ConfigFile.type';
import { deleteCache } from '../../util/cache/cache';
import { SafeError } from '../../util/error/SafeError';
import { useAuth } from '../../util/http/useAuth';
import { log } from '../../util/logging';
import { KeyPerms, usePerms } from '../../util/permissions';

const generateSnowflake = generateSunflake();

type BaseContext = {
    contextType: string;
    data: unknown;
};

export const CreateRoute: FastifyPluginAsync = async (router, options) => {
    router.register(Multipart, {
        // addToBody: true,
        // attachFieldsToBody: true,
        // sharedSchemaId: '#mySharedSchema',
    });

    router.put<
        typeof options & {
            Querystring: {
                site: string;
            };
        }
    >(
        '/push',
        {
            schema: {
                querystring: {
                    type: 'object',
                    properties: {
                        site: { type: 'string' },
                    },
                    required: ['site'],
                },
                headers: {
                    type: 'object',
                    properties: { authorization: { type: 'string' } },
                    required: ['authorization'],
                },
            },
        },
        async (request, reply) => {
            // Check auth
            const { user_id, permissions } = await useAuth(request, reply);

            usePerms(permissions, [KeyPerms.DEPLOYMENTS_WRITE]);

            // Do the rest
            const data = await request.file();

            // Load Context Data
            const contextMultipart = Array.isArray(data.fields.context)
                ? data.fields.context.at(0)
                : data.fields.context;

            const context: BaseContext | undefined = contextMultipart
                ? JSON.parse(contextMultipart['value'])
                : undefined;

            log.debug('Context', context);

            // console.log(request.files);

            const temporary_name = generateSnowflake();

            const site = await DB.selectOneFrom(
                'applications',
                ['app_id', 'owner_id'],
                {
                    app_id: request.query.site,
                }
            );

            if (!site) throw new SafeError(404, '', 'no-site-create');

            if (site.owner_id != user_id)
                throw new SafeError(403, '', 'site-create-no-perms');

            log.ok('Downloading file...');
            addBreadcrumb({
                message: 'Downloading file from ' + request.ip,
            });

            // registerCleanup(() => {
            //     rm(join('tmp', temporary_name), { recursive: true });
            // });

            const strem = Extract({
                concurrency: 10,
                path: join('tmp', temporary_name),
            });

            // Download file and extract to path

            data.file.pipe(strem);
            await strem.promise();

            const bucket_name = await StorageBackend.createBucket();

            await StorageBackend.uploadDirectory(
                bucket_name,
                '/',
                join('tmp', temporary_name)
            );

            const deploy_id = BigInt(generateSnowflake());

            await DB.insertInto('deployments', {
                app_id: site.app_id,
                cid: '',
                deploy_id,
                sid: bucket_name,
                context: context ? JSON.stringify(context) : '',
            });
            const { domain_id } = (await DB.selectOneFrom(
                'applications',
                ['domain_id'],
                { app_id: site.app_id }
            ))!;

            const domain = await DB.selectOneFrom('domains', ['domain'], {
                domain_id,
            });

            await DB.update(
                'applications',
                { last_deployed: new Date().toString() },
                {
                    app_id: site.app_id,
                    owner_id: site.owner_id,
                }
            );

            if (domain) {
                await DB.insertInto('dlt', {
                    app_id: site.app_id,
                    base_url: domain.domain,
                    deploy_id,
                });
                deleteCache('site_' + domain?.domain);

                // Trigger Render
                log.ok('Triggering render for ' + deploy_id);
                const renderConfig = {
                    id: deploy_id,
                    url: 'http://' + domain.domain,
                    viewport: '1920x1080',
                    scales: ['128', '256'],
                };

                CACHE.LPUSH('edge_render_q', JSON.stringify(renderConfig));
            }

            try {
                const configData = await readFile(
                    join('tmp', temporary_name, 'edgerc.json'),
                    'utf8'
                );
                const { config } = JSON.parse(configData) as Edgerc;
                // TODO Validate config before inserting

                await DB.insertInto('deployment_configs', {
                    deploy_id,
                    headers: JSON.stringify(config.headers),
                    redirects: JSON.stringify(config.redirects),
                    rewrites: JSON.stringify(config.rewrites),
                    routing: JSON.stringify(config.routing),
                    ssl: JSON.stringify(config.ssl),
                });
            } catch {
                // Do nothing
            }

            return {
                status: 200,
                logMessages: [
                    'Successfully uploaded site',
                    'SiteID: ' + site.app_id,
                    'Bucket: ' + bucket_name,
                ],
            };
        }
    );
};
