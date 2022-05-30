import { Static, Type } from '@sinclair/typebox';
import { FastifyPluginAsync } from 'fastify';
import { SiweMessage } from 'siwe';

import { DB } from '../../database';
import { signToken } from '../../services/user';
import { log } from '../../util/logging';
import { sentryHandle } from '../../util/sentry/sentryHandle';

export const LoginRoute: FastifyPluginAsync = async (router, options) => {
    // const handle = sentryHandle({
    //     transactionData: {
    //         name: 'Login',
    //         op: 'login',
    //     },
    //     sample: true,
    //     dataConsent: {
    //         ip: true,
    //         request: true,
    //         serverName: true,
    //         transaction: true,
    //         user: true,
    //         version: true,
    //     },
    // });

    // router.get<{
    //     Querystring: {
    //         code: string;
    //     };
    // }>(
    //     '/',
    //     {
    //         schema: {
    //             querystring: {
    //                 type: 'object',
    //                 properties: {
    //                     code: { type: 'string' },
    //                 },
    //                 required: ['code'],
    //             },
    //         },
    //     },
    //     (request, reply) => {
    //         handle(request, reply, async (transaction, registerCleanup) => {
    //             const url = BuildUrl(
    //                 'https://github.com/login/oauth/authorize',
    //                 {
    //                     queryParams: {
    //                         client_id: process.env.GITHUB_ID,
    //                         // redirect_uri: 'http://127.0.0.1:1234/api/oauth/github',
    //                         scope: 'user:user,user:email',
    //                         state: request.query.code,
    //                     },
    //                 }
    //             );

    //             reply.redirect(307, url);
    //         });
    //     }
    // );

    const handle2 = sentryHandle({
        transactionData: {
            name: 'Whitelist check',
            op: 'whitelist-get',
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
            address: string;
        };
    }>(
        '/whitelist/:address',
        {
            schema: {
                params: {
                    type: 'object',
                    properties: {
                        address: { type: 'string' },
                    },
                    required: ['address'],
                },
            },
        },
        (request, reply) => {
            handle2(request, reply, async () => {
                log.debug({ address: request.params.address });

                const user = await DB.selectOneFrom('owners', ['user_id'], {
                    address: request.params.address.toLowerCase(),
                });

                reply.send({
                    exists: !!user,
                });
            });
        }
    );

    const handle3 = sentryHandle({
        transactionData: {
            name: 'Signature Verification',
            op: 'Request JWT',
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

    const SiwePayload = Type.Object({
        message: Type.Object({}),
        signature: Type.String(),
    });

    router.post<{
        Body: Static<typeof SiwePayload>;
    }>(
        '/',
        {
            schema: {
                body: SiwePayload,
            },
        },
        (request, reply) => {
            handle3(request, reply, async (_transaction, _registerCleanup) => {
                log.debug(request.body as {});
                const message = new SiweMessage(request.body.message);

                let verifiedMessage;

                try {
                    verifiedMessage = await message.verify({
                        signature: request.body.signature,
                    });
                } catch {
                    reply.status(403).send();
                    log.debug(
                        'Message verification not successfull',
                        verifiedMessage
                    );

                    return;
                }

                if (!verifiedMessage.success) {
                    reply.status(403).send();
                    log.debug(
                        'Message verification not successfull',
                        verifiedMessage
                    );

                    return;
                }

                const user = await DB.selectOneFrom('owners', ['user_id'], {
                    address: verifiedMessage.data.address.toLowerCase(),
                });

                if (!user) {
                    reply.status(403).send();
                    log.debug(
                        'No user found for address ' +
                            verifiedMessage.data.address.toLowerCase()
                    );

                    return;
                }

                const token = signToken(
                    user.user_id,
                    verifiedMessage.data.address.toLowerCase()
                );

                reply.send({ token });
            });
        }
    );
};
