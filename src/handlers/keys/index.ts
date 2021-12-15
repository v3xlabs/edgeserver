import { RequestHandler, Router } from 'express';
import { useYup } from 'use-yup';
import { log } from '../../util/logging';
import { GET } from './create';
import * as yup from 'yup';

export const KeyRouter = Router();

const useAuth: (handler: RequestHandler) => RequestHandler =
    (handler) => (request, response, next) => {
        if (!request.headers.authorization) return next();
        if (request.headers.authorization !== process.env.SIGNAL_MASTER)
            return next();
        handler(request, response, next);
    };

export const CreateQuery = yup.object({
    account: yup.number(),
});

KeyRouter.get(
    '/create',
    useYup(CreateQuery, (request) => request.query),
    useAuth(GET)
);
