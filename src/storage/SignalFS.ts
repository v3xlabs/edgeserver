import { join } from '@sentry/utils';
import axios from 'axios';
import FormData from 'form-data';
import { createReadStream } from 'node:fs';
import { statSync } from 'node:fs';
import { readdir, rm } from 'node:fs/promises';
import { Readable, Writable } from 'node:stream';

import { Globals } from '..';
import { log } from '../util/logging';
import {
    FileData,
    GenericStorage,
    ResolveData,
    TraceFunction,
} from './GenericStorage';

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
                path
        );

        return data.status == 200 ? data.data : undefined;
    }

    async get(
        bucket_name: string,
        path: string
    ): Promise<FileData | undefined> {
        const data = await axios.get(
            Globals.SIGNALFS_HOST +
                '/buckets/' +
                bucket_name +
                '/get?path=' +
                path,
            {
                method: 'get',
                responseType: 'stream',
                validateStatus: (status) => true,
            }
        );

        if (data.status != 200) return;

        return {
            name: '',
            stream: data.data,
            type: data.headers['content-type'],
        };
    }

    async traverse(
        bucket_name: string,
        path: string
    ): Promise<ResolveData | undefined> {
        while (path.length > 0) {
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

            if (data.status === 200)
                return {
                    path: indexPath,
                    file: {
                        name: '',
                        stream: data.data,
                        type: data.headers['content-type'],
                    },
                };

            if (path.length === 1) return;

            path = join(path, '..');
        }
    }

    async put(
        bucket_name: string,
        path: string,
        write: Readable,
        traceHandler?: TraceFunction
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
        path: string,
        traceHandler: TraceFunction = (v) => v()
    ): Promise<void> {
        const list = await readdir(path);

        for (const entry of list) {
            const data = statSync(join(path, entry));

            if (data.isDirectory()) {
                await this.uploadDirectory(
                    bucket_name,
                    join(prefix, entry),
                    join(path, entry),
                    traceHandler
                );
            }

            if (data.isFile()) {
                await traceHandler(async () => {
                    await this.put(
                        bucket_name,
                        join(prefix, entry),
                        createReadStream(join(path, entry))
                    );
                });
            }
        }
    }
}
