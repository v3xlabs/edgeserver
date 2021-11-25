import { Request, Response, RequestHandler } from 'express';
import { VersionFooter } from '../presets/RejectMessages';
import { log } from '../util/logging';

export type RejectReason = {
    status: number,
    text?: string
};

export const NextHandler: (_function: (request: Request, response: Response) => Promise<void> | Promise<RejectReason>) => RequestHandler = (_function) => {
    return async (request, response, next) => {
        
        let result = await _function(request, response);
        if (typeof result == 'undefined') return;

        log.network('Reject: ' + JSON.stringify(result));
        response.status(result.status);
        response.type('text/plain');
        response.send(result.text + '\n' + VersionFooter);
    };
};