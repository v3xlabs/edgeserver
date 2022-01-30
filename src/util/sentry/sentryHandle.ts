import { LogMethodInput } from '@lvksh/logger';
import {
    addBreadcrumb,
    Event,
    getCurrentHub,
    NodeClient,
    startTransaction,
} from '@sentry/node';
import { parseRequest, ParseRequestOptions } from '@sentry/node/dist/handlers';
import { isAutoSessionTrackingEnabled } from '@sentry/node/dist/sdk';
import { Transaction, TransactionContext } from '@sentry/types';
import { FastifyReply, FastifyRequest } from 'fastify';
import domain from 'node:domain';
import http from 'node:http';

import { log } from '../logging';

type SentryHandleOptions = {
    dataConsent: ParseRequestOptions;
    transactionData: TransactionContext;
};

export type Poof = {
    status: number;
    logMessages: LogMethodInput[];
};

export const sentryHandle = (options: SentryHandleOptions) => {
    const currentHub = getCurrentHub();
    const client = currentHub.getClient<NodeClient>();

    // Initialise an instance of SessionFlusher on the client when `autoSessionTracking` is enabled and the
    // `requestHandler` middleware is used indicating that we are running in SessionAggregates mode
    if (client && isAutoSessionTrackingEnabled(client)) {
        client.initSessionFlusher();

        // If Scope contains a Single mode Session, it is removed in favor of using Session Aggregates mode
        const scope = currentHub.getScope();

        if (scope && scope.getSession()) {
            scope.setSession();
        }
    }

    return async function sentryRequestMiddleware(
        request: FastifyRequest,
        response: FastifyReply,
        next: (transaction: Transaction) => Promise<void | Poof> | void | Poof
    ): Promise<void> {
        const currentHub = getCurrentHub();

        currentHub.configureScope((scope) => {
            scope.addEventProcessor((event: Event) =>
                parseRequest(event, request.raw, options.dataConsent)
            );
            const client = currentHub.getClient<NodeClient>();

            if (isAutoSessionTrackingEnabled(client)) {
                const scope = currentHub.getScope();

                if (scope) {
                    // Set `status` of `RequestSession` to Ok, at the beginning of the request
                    scope.setRequestSession({ status: 'ok' });
                }
            }
        });

        const transaction = startTransaction(options.transactionData);

        response.raw.once('finish', () => {
            const client = currentHub.getClient<NodeClient>();

            if (isAutoSessionTrackingEnabled(client)) {
                setImmediate(() => {
                    if (client && (client as any)._captureRequestSession) {
                        // Calling _captureRequestSession to capture request session at the end of the request by incrementing
                        // the correct SessionAggregates bucket i.e. crashed, errored or exited
                        (client as any)._captureRequestSession();
                    }
                });
            }

            transaction.setHttpStatus(response.statusCode);
            transaction.finish();
        });

        const result = await next(transaction);

        if (result) {
            // transaction.parentSpanId;
            transaction.setTag('reject-reason', result.logMessages.toString());
            response.status(result.status);
            response.send();
            log.ok(...result.logMessages);
        }
    };
};
