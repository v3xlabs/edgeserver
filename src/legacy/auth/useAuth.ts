import { Request, RequestHandler } from 'express';
import { decode } from 'jsonwebtoken';

import { DB } from '../Data';
import { NextHandler } from '../lookup/NextHandler';
import { RejectReason, RejectReasons } from '../net/RejectResponse';
import { log } from '../../util/logging';

export type AuthRequest = Request & {
    auth: {
        user_id: string;
    };
};

export const useAuth: RequestHandler = NextHandler(
    async (request: AuthRequest, response) => {
        if (!request.headers.authorization)
            throw new RejectReason(
                'MALFORMAT',
                'Authorization header was missing'
            );

        let auth = request.headers.authorization;

        if (auth.toLowerCase().startsWith('bearer ')) {
            auth = auth.slice('Bearer '.length);
        }

        const decoded = decode(auth) as { account: string; value: number };

        if (!decoded)
            throw new RejectReason('FORBIDDEN', 'Incorrect decoded payload');

        if (!decoded['account'])
            throw new RejectReason(
                'FORBIDDEN',
                'Key "acount" was missing from payload'
            );

        if (!decoded['value'])
            throw new RejectReason(
                'FORBIDDEN',
                'Key "value" was missing from payload'
            );

        // if (verify(auth, process.env.SIGNAL_MASTER)) return Malformat();

        const key = await DB.selectOneFrom('keys', ['owner_id'], {
            key: decoded.value.toString(),
        });

        if (!key) throw new RejectReason('FORBIDDEN', 'Not owner of Site');

        if (key.owner_id.toString() !== decoded.account)
            throw new RejectReason('FORBIDDEN', 'Not owner of Site v2');

        request.auth = {
            user_id: key.owner_id,
        };
        log.network('Verified Auth for user ' + key.owner_id);
    }
);
