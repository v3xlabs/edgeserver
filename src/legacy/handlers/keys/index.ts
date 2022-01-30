import { ErrorRequestHandler, RequestHandler, Router } from 'express';
import { useYup } from 'use-yup';
import * as yup from 'yup';

import { GET } from './create';

export const KeyRouter = Router();

const useAuth: (handler: RequestHandler) => RequestHandler =
    (handler) => (request, response, next) => {
        if (!request.headers.authorization) return next();

        if (request.headers.authorization !== process.env.SIGNAL_MASTER)
            return next();

        handler(request, response, next);
    };

export const CreateQuery = yup.object().shape({
    account: yup.number().required(),
});

KeyRouter.get(
    '/create',
    useYup(CreateQuery, (request) => request.query),
    useAuth(GET)
);

const errorHandler: ErrorRequestHandler = (error, request, response, next) => {
    if (error) {
        response.status(500);
        response.type('text/plain');
        response.send(error.toString());
    }
};

KeyRouter.use(errorHandler);
