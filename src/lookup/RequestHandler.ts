import { DB } from '../Data';
import {
    DomainNotFound
} from '../presets/RejectMessages';
import { NextHandler } from './NextHandler';
import { request as httpRequest } from 'node:http';
import { join, basename } from 'node:path';
import { log } from '../util/logging';
import { create } from 'ipfs-http-client';

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

    const ipfs = create({
        url: process.env.IPFS_API || 'http://localhost:5001',
    });

    // Verify if file exists on IPFS node
    let ogFeds = await ipfs.resolve(join(a.cid, request.path));
    log.debug({ ogFeds });

    // If directory
    let optionalSuffix = '';
    const abc = await ipfs.files.stat(ogFeds, {});
    log.debug(abc);

    let feds = ogFeds;
    if (abc.type === 'directory') {
        try {
            const feds2 = await ipfs.resolve(
                join(a.cid, request.path, 'index.html')
            );
            optionalSuffix = 'index.html';
            log.debug(feds2);
            feds = feds2;
        } catch (error) {
            log.debug('No index.html found', error);
        }
    }

    const mimeType = basename(join(request.path, optionalSuffix));
    log.debug({ mimeType });

    // Setup headers
    response.contentType(mimeType);
    response.setHeader('Cache-Control', 'max-age=60');
    if (process.env.ADD_HEADER) {
        response.setHeader('x-ipfs-path', '/ipfs/' + abc.cid.toString());
    }

    // Fetch file from IPFS Endpoint
    await new Promise<void>((accept) => {
        var contentRequest = httpRequest(
            join(process.env.IPFS_IP || 'http://127.0.0.1:8080', feds),
            (incomming) => {
                // for (const a of Object.keys(incomming.headers)) {
                //     if (a.toLowerCase() === 'content-type') continue;
                //     response.setHeader(a, incomming.headers[a]);
                // }
                incomming.on('data', (chunk) => {
                    response.write(chunk);
                });
                incomming.on('end', () => {
                    accept();
                });
            }
        );
        contentRequest.on('error', (error) => {
            log.error(error);
        });
        contentRequest.end();
    });
    response.end();
    return 0;
});
