import { DB } from '../Data';
import { DomainNotFound, EmptyDirectory, FileNotFound } from '../presets/RejectMessages';
import { NextHandler } from './NextHandler';
import { request as httpRequest } from 'node:http';
import { join } from 'node:path';

export const handleRequest = NextHandler(async (request, response) => {
    console.log('Incomming request at ' + request.hostname + ' ' + request.path);

    // Lookup the site by hostname from the database
    const a = await DB.selectOneFrom('sitelookup', ['site_id'], { host: request.hostname });

    // Reject if the host does not exist
    if (!a) return DomainNotFound(request.hostname + request.path);

    const b = await DB.selectOneFrom('edgenames', ['cid'], { site_id: a.site_id });

    // Verify if file exists on IPFS node
    const fileData = await new Promise<Object>((accept, reject) => {
        const preparedURL = (process.env.IPFS_API || 'http://127.0.0.1:5001') + '/api/v0/file/ls?arg=' + (join(b.cid, request.path));
        var existsRequest = httpRequest({
            method: 'post',
            host: '127.0.0.1',
            port: 5001,
            path: '/api/v0/file/ls?arg=' + (join(b.cid, request.path))
        }, (incomming) => {
            let data = '';
            incomming.on('data', (chunk) => {
                data += chunk;
            });
            incomming.on('end', () => {
                accept(JSON.parse(data));
            });
        });
        existsRequest.end();
    });

    // If not exists return
    if (fileData['Type'] == 'error') return FileNotFound(request.hostname + request.path);

    // If directory
    let optionalSuffix = '';
    if (fileData['Objects']) {
        const localCID = Object.keys(fileData['Objects'])[0];
        if (!fileData['Objects'][localCID]) {
            return { status: 500, text: 'file not there...' };
        }

        if (fileData['Objects'][localCID]['Type'] == 'Directory') {

            // Find the index.html
            let fileFound = false;
            for (let item of fileData['Objects'][localCID]['Links']) {
                
                // If name is empty, assume its a spread file
                if (item['Name'].length === 0) {
                    break;
                }

                // Check if file is index.html
                if (item['Name'] == 'index.html' && item['Type'] == 'File') {
                    optionalSuffix = 'index.html';
                    fileFound = true;
                    break;
                }
            }

            // If no index.html found throw
            if (!fileFound) return EmptyDirectory(request.hostname + request.path);
        }
    }

    // Fetch file from IPFS Endpoint
    var contentRequest = httpRequest(join(process.env.IPFS_IP || 'http://127.0.0.1:8080', 'ipfs', b.cid, request.path, optionalSuffix), (incomming) => {
        for (const a of Object.keys(incomming.headers)) {
            response.setHeader(a, incomming.headers[a]);
        }
        incomming.on('data', (chunk) => {
            response.write(chunk);
        });
        incomming.on('end', () => {
            response.send();
        });
    });
    contentRequest.on('error', (error) => {
        console.log(error);
    });
    contentRequest.end();
});