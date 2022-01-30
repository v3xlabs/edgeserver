import { RequestHandler } from 'express';

export const useHost: (handler: RequestHandler) => RequestHandler =
    (handler) => (request, response, next) => {
        if (request.hostname !== process.env.SIGNAL_HOST) return next();

        handler(request, response, next);
    };
