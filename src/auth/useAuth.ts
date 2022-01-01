import { Request, RequestHandler, Response } from 'express';
import { decode, verify } from 'jsonwebtoken';
import { DB } from '../Data';
import { NextHandler } from '../lookup/NextHandler';
import { Malformat, NoPermission } from '../presets/RejectMessages';
import { log } from '../util/logging';

export type AuthRequest = Request & {
    auth: {
        user_id: Long;
    };
};

export const useAuth: RequestHandler = NextHandler(
    async (request: AuthRequest, response) => {
        if (!request.headers.authorization) return NoPermission();
        let auth = request.headers.authorization;

        if (auth.toLowerCase().startsWith('Bearer ')) {
            auth = auth.slice(0, Math.max(0, 'Bearer '.length));
        }

        const decoded = decode(auth) as { account: string; value: number };

        if (!decoded) return NoPermission();
        if (!decoded['account']) return Malformat();
        if (!decoded['value']) return Malformat();

        // if (verify(auth, process.env.SIGNAL_MASTER)) return Malformat();

        const key = await DB.selectOneFrom('keys', ['owner_id'], {
            key: decoded.value.toString(),
        });

        if (!key) return NoPermission();
        if (key.owner_id.toString() !== decoded.account) return NoPermission();

        request.auth = {
            user_id: key.owner_id
        };
        log.network('Verified Auth for user ' + key.owner_id);
    }
);
