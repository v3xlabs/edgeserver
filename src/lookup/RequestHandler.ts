import { DB } from '../Data';
import {
    DomainNotFound,
    EmptyDirectory,
    FileNotFound,
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
    const a = await DB.selectOneFrom('sitelookup', ['site_id'], {
        host: request.hostname,
    });

    // Reject if the host does not exist
    if (!a) return DomainNotFound(request.hostname + request.path);

    const b = await DB.selectOneFrom('edgenames', ['cid'], {
        site_id: a.site_id,
    });

    const ipfs = create({
        url: 'http://localhost:5001',
    });

    // Verify if file exists on IPFS node
    // const fileData = await ipfs.resolve(join(b.cid));
    // log.debug({fileData});
    let ogFeds = await ipfs.resolve(join(b.cid, request.path));
    log.debug({ ogFeds });

    // // If not exists return
    // if (fileData.type !== 'file' && fileData.type !== 'directory')
    //     return FileNotFound(request.hostname + request.path);

    // If directory
    let optionalSuffix = '';
    const abc = await ipfs.files.stat(ogFeds, {});
    log.debug(abc);

    let feds = ogFeds;
    if (abc.type === 'directory') {
        try {
            const feds2 = await ipfs.resolve(
                join(b.cid, request.path, 'index.html')
            );
            optionalSuffix = 'index.html';
            log.debug(feds2);
            feds = feds2;
        } catch (error) {
            log.debug('No index.html found', error);
        }
    }
    // const f =
    // if (fileData.type === 'directory') {
    //     const localCID = Object.keys(fileData['Objects'])[0];
    //     if (!fileData['Objects'][localCID]) {
    //         return { status: 500, text: 'file not there...' };
    //     }

    //     if (fileData['Objects'][localCID]['Type'] == 'Directory') {
    //         // Find the index.html
    //         let fileFound = false;
    //         for (let item of fileData['Objects'][localCID]['Links']) {
    //             // If name is empty, assume its a spread file
    //             if (item['Name'].length === 0) {
    //                 break;
    //             }

    //             // Check if file is index.html
    //             if (item['Name'] == 'index.html' && item['Type'] == 'File') {
    //                 optionalSuffix = 'index.html';
    //                 fileFound = true;
    //                 break;
    //             }
    //         }

    //         // If no index.html found throw
    //         if (!fileFound)
    //             return EmptyDirectory(request.hostname + request.path);
    //     }
    // }

    const mimeType = basename(join(request.path, optionalSuffix));
    log.debug({ mimeType });

    // Setup headers
    response.contentType(mimeType);
    response.setHeader('Cache-Control', 'max-age=60');
    response.setHeader('x-ipfs-path', '/ipfs/' + abc.cid.toString());

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
