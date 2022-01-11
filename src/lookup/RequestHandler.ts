import { DB } from '../Data';
import { DomainNotFound, FileNotFound } from '../presets/RejectMessages';
import { NextHandler } from './NextHandler';
import { request as httpRequest } from 'node:http';
import { join, basename } from 'node:path';
import { log } from '../util/logging';
import { create, IPFSHTTPClient } from 'ipfs-http-client';
import { StatResult } from 'ipfs-core-types/src/files';

const resolveFile = async (
    ipfs: IPFSHTTPClient,
    prefixPath: string,
    path: string,
    index = 0
): Promise<{ fileType: string; path: string } | undefined> => {
    if (index > 10) return undefined;

    log.debug('resolving', path);

    try {
        let fileAtPath = await ipfs.resolve(join(prefixPath, path));
        log.debug('fileAtPath', fileAtPath);

        const ipfsFile = await ipfs.files.stat(fileAtPath, {});
        if (ipfsFile && ipfsFile.type === 'file') {
            return {
                fileType: basename(path),
                path: fileAtPath,
            };
        }

        if (ipfsFile.type === 'directory') {
            try {
                const indexInFolderPath = join(prefixPath, path, 'index.html');
                const indexInFolder = await ipfs.resolve(indexInFolderPath);
                log.debug('indexInFolder', indexInFolder);
                if (indexInFolder) {
                    const ipfsIndexInFolder = await ipfs.files.stat(
                        indexInFolder,
                        {}
                    );
                    log.debug('ipfsIndexInFolder', indexInFolder);
                    if (
                        ipfsIndexInFolder &&
                        ipfsIndexInFolder.type === 'file'
                    ) {
                        return {
                            fileType: basename(indexInFolderPath),
                            path: indexInFolder,
                        };
                    }
                }
            } catch (error) {
                log.debug('No index.html found', error);
            }
        }
    } catch {}

    if (path.length < 2) return undefined;

    log.debug('shortening to', join(path, '../'));
    return await resolveFile(ipfs, prefixPath, join(path, '../'), index - 1);
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

    const ipfs = create({
        url: process.env.IPFS_API || 'http://localhost:5001',
    });

    // Verify if file exists on IPFS node
    const nextPath = await resolveFile(ipfs, a.cid, request.path);

    if (!nextPath || nextPath.path.length === 0)
        return FileNotFound(request.path);

    const mimeType = nextPath.fileType;
    log.debug({ mimeType });

    // Setup headers
    response.contentType(mimeType);
    response.setHeader('Cache-Control', 'max-age=60');
    if (process.env.ADD_HEADER) {
        response.setHeader('x-ipfs-path', nextPath.path);
    }

    // Fetch file from IPFS Endpoint
    await new Promise<void>((accept) => {
        var contentRequest = httpRequest(
            join(process.env.IPFS_IP || 'http://127.0.0.1:8080', nextPath.path),
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
            response.write('oops');
            response.end();
        });
        contentRequest.end();
    });
    response.end();
    return 0;
});
