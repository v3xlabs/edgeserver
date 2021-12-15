import { RequestHandler, Router } from 'express';
import { useYup } from 'use-yup';
import { log } from '../../util/logging';
import * as yup from 'yup';
import { useHost } from '../../auth/useHost';
import { NextHandler } from '../../lookup/NextHandler';
import { AuthRequest, useAuth } from '../../auth/useAuth';
import { createWriteStream } from 'node:fs';

export const DeploymentRouter = Router();

DeploymentRouter.put(
    '/push',
    useAuth,
    async (request: AuthRequest, response) => {
        // log.debug(request['files']);
        const f = request.pipe(createWriteStream('some/path'));
        response.send('Hello ' + request.auth.user_id);
    }
);

// DeploymentRouter.get(
//     '/create',
//     useYup(CreateQuery, (request) => request.query),
//     useKeyHost(GET)
// );
