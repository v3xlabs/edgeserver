import axios from 'axios';
import FormData from 'form-data';
import { createReadStream } from 'node:fs';
import { readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { Readable } from 'node:stream';
import fetch from 'node-fetch';

import { Globals } from '..';
import { log } from '../util/logging';
import { FileData, GenericStorage, ResolveData } from './GenericStorage';

export class SignalStorage implements GenericStorage {
    async exists(
        bucket_name: string,
        path: string
    ): Promise<{ type: 'directory' | 'file' } | undefined> {
        const data = await axios.get(
            Globals.SIGNALFS_HOST +
                '/buckets/' +
                bucket_name +
                '/exists?path=' +
                path,
            { validateStatus: (_v) => true }
        );

        return data.status == 200 ? data.data : undefined;
    }

    async get(
        bucket_name: string,
        path: string
    ): Promise<FileData | undefined> {
        const data = await fetch(
            Globals.SIGNALFS_HOST +
                '/buckets/' +
                bucket_name +
                '/get?path=' +
                path,
            {
                method: 'get',
            }
        );

        if (data.status != 200) return;

        log.debug(
            Globals.SIGNALFS_HOST +
                '/buckets/' +
                bucket_name +
                '/get?path=' +
                path
        );

        const header = data.headers.get('content-type');
        const header2 = header && Array.isArray(header) ? header.at(0) : header;
        const lengthHeader = data.headers.get('content-length');
        const header3 =
            lengthHeader && Array.isArray(lengthHeader)
                ? lengthHeader.at(0)
                : lengthHeader;

        return {
            name: '',
            stream: data.body,
            type: header2 || 'text/plain',
            length: header3 || '0',
        };
    }

    async traverse(
        bucket_name: string,
        path: string
    ): Promise<ResolveData | undefined> {
        while (path.length > 1) {
            const indexPath = join(path, '.', 'index.html');
            const data = await axios.get(
                Globals.SIGNALFS_HOST +
                    '/buckets/' +
                    bucket_name +
                    '/get?path=' +
                    indexPath,
                {
                    method: 'get',
                    responseType: 'stream',
                    validateStatus: (status) => true,
                }
            );

            if (data.status === 200) {
                return {
                    path: indexPath,
                    file: {
                        name: '',
                        stream: data.data,
                        type: data.headers['content-type'],
                        length: data.headers['content-length'],
                    },
                };
            }

            if (path.length === 1) return;

            path = join(path, '..');
        }
    }

    async put(
        bucket_name: string,
        path: string,
        write: Readable
    ): Promise<void> {
        const f = write;
        const formData = new FormData();

        formData.append('file', f);

        await axios.post(
            Globals.SIGNALFS_HOST +
                '/buckets/' +
                bucket_name +
                '/put?path=' +
                path,
            formData,
            {
                headers: formData.getHeaders(),
                maxBodyLength: Number.POSITIVE_INFINITY,
                maxContentLength: Number.POSITIVE_INFINITY,
            }
        );
    }

    async createBucket(): Promise<string> {
        const request = await axios.post(Globals.SIGNALFS_HOST + '/buckets', {
            validateStatus: false,
        });

        const data = request.data as { bucket_name: string };

        return data.bucket_name;
    }

    async uploadDirectory(
        bucket_name: string,
        prefix: string,
        path: string
    ): Promise<void> {
        // Index
        const file_names = await readdir(path, {
            withFileTypes: true,
            encoding: 'utf8',
        });

        // Sort it so files get uploaded first, then directories
        const sorted_file_names = file_names.sort(
            (a, b) => +b.isFile() - +a.isFile()
        );

        const actions: (Promise<unknown> | unknown)[] = [];

        for (const entry of sorted_file_names) {
            if (entry.isFile()) {
                actions.push(
                    this.put(
                        bucket_name,
                        join(prefix, entry.name),
                        createReadStream(join(path, entry.name))
                    )
                );
            }

            if (entry.isDirectory()) {
                actions.push(
                    this.uploadDirectory(
                        bucket_name,
                        join(prefix, entry.name),
                        join(path, entry.name)
                    )
                );
            }
        }

        // Execute
        await Promise.allSettled(actions);
    }
}
