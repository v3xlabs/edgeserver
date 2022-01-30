import { join } from '@sentry/utils';
import axios from 'axios';
import { Readable, Writable } from 'form-data';

import { Globals } from '..';
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
        write: Writable
    ): Promise<void> {}
}
