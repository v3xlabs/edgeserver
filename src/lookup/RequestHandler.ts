import axios from 'axios';
import { join } from 'node:path';
import { finished } from 'node:stream/promises';

import { DB } from '../Data';
import { DomainNotFound, FileNotFound } from '../presets/RejectMessages';
import { log } from '../util/logging';
import { NextHandler } from './NextHandler';

const traverseFolderUntilExists = async (bucket_name: string, path: string) => {
    if (path == '/') return;

    const data = await axios.get(
        'http://localhost:8000/buckets/' + bucket_name + '/exists?path=' + path
    );

    if (data.status == 200 && data.data.type == 'directory') return path;

    return traverseFolderUntilExists(bucket_name, join(path, '..'));
};

const getFileOrIndex = async (cid: string, path: string) => {
    const f = await Promise.allSettled([
        axios.get(
            'http://localhost:8000/buckets/' + cid + '/exists?path=' + path,
            {
                validateStatus: (status) => true,
            }
        ),
        axios.get(
            'http://localhost:8000/buckets/' + cid + '/get?path=' + path,
            {
                method: 'get',
                responseType: 'stream',
                validateStatus: (status) => true,
            }
        ),
    ]);

    // If either error, reject
    if (f.at(0).status == 'rejected') return;

    if (f.at(1).status == 'rejected') return;

    log.debug(f.at(0).value.status.toString());

    //
    if (f.at(0).value.status == 200 && f.at(0).value.data.type !== 'directory')
        return f.at(1).value;

    let index_ = 0;

    while (path.length > 1) {
        if (index_ > 0) path = join(path, '..');

        log.debug('shipping index i guess ', path);
        const index = await axios.get(
            'http://localhost:8000/buckets/' +
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
