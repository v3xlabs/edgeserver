import { Request, RequestHandler, Response } from 'express';

import { VersionFooter } from '../presets/RejectMessages';
import { log } from '../util/logging';

export type RejectReason = {
    status: number;
    text?: string;
};

export const NextHandler: (
    _function: (
        request: Request,
        response: Response
    ) => Promise<void> | Promise<RejectReason | 0>
) => RequestHandler = (_function) => {
    return async (request, response, next) => {
        try {
            const result = await _function(request, response);

            if (typeof result == 'undefined') return next();

            if (result === 0) return;

            log.network(result);
            response.status(result.status);
            response.type('text/plain');
            response.send(result.text + '\n' + VersionFooter);
        } catch (error) {
            log.network(error);
            response.status(500);
            response.type('text/plain');
            response.send(error.toString() + '\n' + VersionFooter);
        }
    };
};
