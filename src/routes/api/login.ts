import BuildUrl from 'build-url';
import { FastifyPluginAsync } from 'fastify';

import { CACHE, getCache } from '../../cache';
import { setPSKfromState, signToken } from '../../services/user';
import { log } from '../../util/logging';
import { sentryHandle } from '../../util/sentry/sentryHandle';
import { generateSnowflake } from '.';

export const LoginRoute: FastifyPluginAsync = async (router, options) => {
    const handle = sentryHandle({
        transactionData: {
            name: 'Login',
            op: 'login',
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
            const url = BuildUrl('https://github.com/login/oauth/authorize', {
                queryParams: {
                    client_id: process.env.GITHUB_ID,
                    // redirect_uri: 'http://127.0.0.1:1234/api/oauth/github',
                    scope: 'user:user,user:email',
                    state: '5',
                },
            });

            reply.redirect(307, url);
        });
    });

    const handle2 = sentryHandle({
        transactionData: {
            name: 'Login Status',
            op: 'login-status',
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

    router.get<{
        Params: {
            psk: string;
        };
    }>(
        '/status/:psk',
        {
            schema: {
                params: {
                    type: 'object',
                    properties: {
                        psk: { type: 'string' },
                    },
                    required: ['psk'],
                },
            },
        },
        (request, reply) => {
            handle2(request, reply, async (transaction, registerCleanup) => {
                await getCache();
                log.debug(request.params.psk);
                const user_id = await CACHE.get(
                    'sedge-auth-link-' + request.params.psk
                );

                log.debug(user_id);

                if (!user_id) {
                    reply.status(401).send({ error: 'Unauthorized' });

                    return;
                }

                reply.send({ token: signToken(user_id) });
            });
        }
    );

    const handle3 = sentryHandle({
        transactionData: {
            name: 'Request Login Status',
            op: 'Request login-status',
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

    router.post('/', (request, reply) => {
        handle3(request, reply, async (transaction, registerCleanup) => {
            const psk = generateSnowflake();
            const code = generateSnowflake();

            setPSKfromState(code, psk);
            reply.send({ psk, code });
        });
    });
};
