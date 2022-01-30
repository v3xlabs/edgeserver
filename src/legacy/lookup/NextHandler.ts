import { captureException, startTransaction } from '@sentry/node';
import * as Sentry from '@sentry/node';
import { Transaction } from '@sentry/types';
import { Request, RequestHandler, Response } from 'express';

import { shouldSentry } from '..';
import { RejectReason, RejectReasons } from '../net/RejectResponse';
import { log } from '../../util/logging';

export const NextHandler: (
    _function: (
        request: Request,
        response: Response,
        transaction?: Transaction
    ) => Promise<void> | Promise<void>
) => RequestHandler = (_function) => {
    return async (request, response, next) => {
        const transaction = shouldSentry
            ? startTransaction({
                  op: 'request_thing',
                  name: 'request',
              })
            : undefined;

        try {
            const result = await _function(request, response, transaction);

            // if (typeof result == 'undefined') return next();

            // if (result === 0) return;

            // log.network(result);
            // response.status(result.status);
            // response.type('text/plain');
            // response.send(result.text + '\n' + VersionFooter);
        } catch (error) {
            if (error instanceof RejectReason) {
                log.network(...error.serverError);
                response.status(RejectReasons[error.reason].status);
                response.type('text/plain');
            }

            log.network(error);
            captureException(error);
            response.status(500);
            response.send();
        } finally {
            transaction.finish();
        }
    };
};
