import { FastifyPluginAsync } from 'fastify';

import { CACHE, getCache } from '../../cache';
import { getAccessToken, getUserData } from '../../services/github';
import {
    createUserFromGithub,
    getLoginSessionByState,
    getUserByGithub,
} from '../../services/user';
import { log } from '../../util/logging';
import { sentryHandle } from '../../util/sentry/sentryHandle';

export const OAuthRoute: FastifyPluginAsync = async (router, options) => {
    const handle = sentryHandle({
        transactionData: {
            name: 'OAuth',
            op: 'oauth',
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

    router.get('/', (request, reply) => {
        handle(request, reply, async (transaction, registerCleanup) => {
            reply.send('hi');
        });
    });

    router.get<
        typeof options & {
            Querystring: {
                code: string;
                state: string;
            };
        }
    >(
        '/github',
        {
            schema: {
                querystring: {
                    type: 'object',
                    properties: {
                        code: { type: 'string' },
                        state: { type: 'string' },
                    },
                    required: ['code'],
                },
            },
        },
        (request, reply) => {
            handle(request, reply, async (transaction, registerCleanup) => {
                const { code, state } = request.query;

                const access_token = await getAccessToken(code);

                const github_user_data = await getUserData(access_token);

                const user =
                    (await getUserByGithub(github_user_data.id.toString())) ||
                    (await createUserFromGithub(github_user_data));

                // const token = signToken(user.user_id);
                // get the psk from code,
                const psk = await getLoginSessionByState(state);

                log.debug({ psk });

                // set the `cli-stage-code` to `user_id`
                await getCache();
                console.log(user.user_id);
                CACHE.set('sedge-auth-link-' + psk, user.user_id.toString(), {
                    EX: 60 * 5,
                });

                reply.send('You can close this screen now');
            });
        }
    );

    /*
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
                const auth = await useAuth(request, reply);

                if (typeof auth !== 'string') {
                    return auth;
                }

                // Do the rest
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
    );*/
};
