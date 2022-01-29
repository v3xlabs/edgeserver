import axios from 'axios';
import { join } from 'node:path';
import { finished } from 'node:stream/promises';

import { DB } from '../Data';
import { DomainNotFound, FileNotFound } from '../presets/RejectMessages';
import { Globals } from '../util/Globals';
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

const getFileOrIndex = async (cid: string, path: string) => {
    const [existsRequest, getRequest] = await Promise.allSettled([
        axios.get(
            Globals.SIGNALFS_HOST + '/buckets/' + cid + '/exists?path=' + path,
            {
                validateStatus: (status) => true,
            }
        ),
        axios.get(
            Globals.SIGNALFS_HOST + '/buckets/' + cid + '/get?path=' + path,
            {
                method: 'get',
                responseType: 'stream',
                validateStatus: (status) => true,
            }
        ),
    ]);

    // If either error, reject
    if (existsRequest.status == 'rejected') return;

    if (getRequest.status == 'rejected') return;

    log.debug(existsRequest.value.status.toString());

    //
    if (
        existsRequest.value.status == 200 &&
        existsRequest.value.data.type !== 'directory'
    )
        return getRequest.value;

    let index_ = 0;

    while (path.length > 1) {
        if (index_ > 0) path = join(path, '..');

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

export const handleRequest = NextHandler(async (request, response) => {
    log.network(
        'Incomming request at ' + request.hostname + ' ' + request.path
    );

    // Lookup the site by hostname from the database
    const a = await DB.selectOneFrom('sites', ['site_id', 'cid'], {
        host: request.hostname,
    });

    // Reject if the host does not exist
    if (!a) return DomainNotFound(request.hostname + request.path);

    const path = request.path == '/' ? '/index.html' : request.path;

    // Verify if file exists on IPFS node
    const fa = await getFileOrIndex(a.cid, path);

    if (!fa) return FileNotFound(request.path);

    if (fa.status == 201) return DomainNotFound(request.hostname);

    if (fa.status == 404) return FileNotFound(request.path);

    if (fa.status != 200) return DomainNotFound(request.hostname);

    // log.debug(f.ok);
    // if (!f.ok) return;
    response.setHeader('Cache-Control', 'max-age=60');
    log.debug(fa.headers['content-type']);
    response.type(fa.headers['content-type']);

    await fa.data.pipe(response);
    await finished(fa.data);

    response.end();

    return 0;
});
