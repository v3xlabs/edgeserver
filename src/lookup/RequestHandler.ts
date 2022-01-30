import * as Sentry from '@sentry/node';
import { Span, Transaction } from '@sentry/types';
import axios from 'axios';
import { join } from 'node:path';
import { finished } from 'node:stream/promises';

import { Globals } from '..';
import { DB } from '../Data';
import { RejectReason } from '../net/RejectResponse';
import { log } from '../util/logging';
import { NextHandler } from './NextHandler';

const traverseFolderUntilExists = async (bucket_name: string, path: string) => {
    if (path == '/') return;

    const data = await axios.get(
        Globals.SIGNALFS_HOST +
            '/buckets/' +
            bucket_name +
            '/exists?path=' +
            path
    );

    if (data.status == 200 && data.data.type == 'directory') return path;

    return traverseFolderUntilExists(bucket_name, join(path, '..'));
};

const getFileOrIndex = async (
    cid: string,
    path: string,
    transaction?: Span
) => {
    const [existsRequest, getRequest] = await Promise.allSettled([
        axios.get(
            Globals.SIGNALFS_HOST + '/buckets/' + cid + '/exists?path=' + path,
            {
                validateStatus: (status) => true,
                timeout: 100,
            }
        ),
        axios.get(
            Globals.SIGNALFS_HOST + '/buckets/' + cid + '/get?path=' + path,
            {
                method: 'get',
                responseType: 'stream',
                validateStatus: (status) => true,
                timeout: 100,
            }
        ),
    ]);

    Sentry.addBreadcrumb({
        message: 'Requested ' + path,
    });

    // If either error, reject
    if (
        existsRequest.status === 'rejected' ||
        getRequest.status === 'rejected'
    ) {
        Sentry.addBreadcrumb({
            message: 'One of the requests was rejected',
        });

        return;
    }

    log.debug(existsRequest.value.status.toString());

    //
    if (
        existsRequest.value.status == 200 &&
        existsRequest.value.data.type !== 'directory'
    ) {
        Sentry.addBreadcrumb({
            message: 'Serving file',
        });

        return getRequest.value;
    }

    let index_ = 0;

    while (path.length > 1) {
        if (index_ > 0) path = join(path, '..');

        Sentry.addBreadcrumb({
            message: 'Checking ' + path,
        });

        log.debug('shipping index i guess ', path);
        const index = await axios.get(
            Globals.SIGNALFS_HOST +
                '/buckets/' +
                cid +
                '/get?path=' +
                join(path, '.', 'index.html'),
            {
                method: 'get',
                responseType: 'stream',
                validateStatus: (status) => true,
            }
        );

        if (index.status == 200) return index;

        index_++;
    }
};

export const handleRequest = NextHandler(
    async (request, response, transaction) => {
        log.network(
            'Incomming request at ' + request.hostname + ' ' + request.path
        );

        transaction?.setData('host', request.hostname);
        transaction?.setData('path', request.path);

        const databaseRequest = transaction.startChild({
            op: 'DB Query',
            description: 'Getting site by site id',
            data: {
                host: request.hostname,
            },
        });

        // Lookup the site by hostname from the database
        const a = await DB.selectOneFrom('sites', ['site_id', 'cid'], {
            host: request.hostname,
        });

        databaseRequest.finish();

        // Reject if the host does not exist
        if (!a)
            throw new RejectReason(
                'NOT_FOUND',
                `Could not find ${request.hostname + request.path}`
            );

        const path = request.path == '/' ? '/index.html' : request.path;

        // Verify if file exists on IPFS node
        const getFileOrIndexSpan = transaction.startChild({
            op: 'getFileOrIndex',
        });

        const fa = await getFileOrIndex(a.cid, path, getFileOrIndexSpan);

        getFileOrIndexSpan.finish();

        if (!fa || fa.status == 404)
            throw new RejectReason(
                'NOT_FOUND',
                'File could not be found in storage',
                request.path
            );

        if (fa.status == 201 || fa.status != 200)
            throw new RejectReason(
                'NOT_FOUND',
                'Domain not found',
                request.hostname
            );

        response.setHeader('Cache-Control', 'max-age=60');
        log.debug(fa.headers['content-type']);
        response.type(fa.headers['content-type']);

        await fa.data.pipe(response);
        await finished(fa.data);

        response.end();
    }
);
