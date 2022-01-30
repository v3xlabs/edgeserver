import axios from 'axios';
import { Router } from 'express';
import fileUpload, { UploadedFile } from 'express-fileupload';
import FormData from 'form-data';
import Long from 'long';
import { createReadStream, rmSync } from 'node:fs';
import { statSync } from 'node:fs';
import { readdir, rm } from 'node:fs/promises';
import { join, normalize } from 'node:path';
import { Extract } from 'unzipper';
import { useYup, UseYupRequest } from 'use-yup';
import * as yup from 'yup';

import { Globals } from '../../..';
import { AuthRequest, useAuth } from '../../auth/useAuth';
import { DB } from '../../../database';
import { log } from '../../../util/logging';

export const DeploymentRouter = Router();

DeploymentRouter.use(
    fileUpload({
        useTempFiles: true,
        tempFileDir: 'tmp/',
    })
);

const SiteQuery = yup.object({
    site: yup.string().required(),
});

const createBucket = async () => {
    const request = await axios.post(Globals.SIGNALFS_HOST + '/buckets', {
        validateStatus: false,
    });

    const data = request.data as { bucket_name: string };

    return data.bucket_name;
};
const uploadFile = async (bucket_name: string, path: string, file: string) => {
    const f = createReadStream(file);
    const formData = new FormData();

    formData.append('file', f);

    await axios.post(
        Globals.SIGNALFS_HOST + '/buckets/' + bucket_name + '/put?path=' + path,
        formData,
        {
            headers: formData.getHeaders(),
            maxBodyLength: Number.POSITIVE_INFINITY,
            maxContentLength: Number.POSITIVE_INFINITY,
        }
    );
};
const uploadDirectory = async (
    bucket_name: string,
    prefix: string,
    path: string
) => {
    log.debug({ bucket_name, prefix, path });

    const list = await readdir(path);

    for (const entry of list) {
        const data = statSync(join(path, entry));

        if (data.isDirectory()) {
            log.debug('dir ' + entry);
            // await axios.get(
            //     'http://localhost:8000/buckets/' +
            //         bucket_name +
            //         '/mkdir?path=' +
            //         join(normalize(prefix), entry)
            // );
            await uploadDirectory(
                bucket_name,
                join(prefix, entry),
                join(path, entry)
            );
        }

        if (data.isFile()) {
            log.debug('file', entry);
            await uploadFile(
                bucket_name,
                join(prefix, entry),
                join(path, entry)
            );
        }
    }
};

DeploymentRouter.put(
    '/push',
    useYup(SiteQuery, (v) => v.query),
    useAuth,
    async (
        request: AuthRequest & UseYupRequest<typeof SiteQuery>,
        response
    ) => {
        const id = request.yupData.site;
        const site = await DB.selectOneFrom('sites', ['site_id'], {
            site_id: id,
        });

        if (!site) return '';

        const { files, auth } = request;

        if (!files) return '';

        if (!Object.keys(files).includes('data')) return '';

        const file = files['data'] as UploadedFile;

        log.debug({ file });

        const feee = createReadStream(file.tempFilePath);

        feee.pipe(Extract({ path: 'tmp/test' }));

        await new Promise<void>((accept) => {
            feee.on('close', accept);
        });

        log.debug('finished extracting');

        await rm(file.tempFilePath);

        const handPath = 'sites/' + site.site_id;

        log.debug('creating bucket');

        // create bucket
        const cid = await createBucket();

        log.database('fff', cid);

        await new Promise<void>((accept) => setTimeout(accept, 1000));

        // Uploadddd

        await uploadDirectory(cid, '', 'tmp/test');

        // await uploadFile(cid, 'index.html', 'tmp/test/index.html');

        // let out: AddResult = {path: '', cid: };
        // for await (const file of await f.addAll(
        // iterateDelay('/' + handPath, globSource('tmp/test', '**/*'))
        // )) {
        //     log.debug(file);
        //     if (file.path === handPath) {
        //         out = file;
        //     }
        // }

        await new Promise<void>((accept) => setTimeout(accept, 1000));

        try {
            await rm('tmp/test', { recursive: true });
        } catch {
            log.debug('Failed to delete folder');
        }

        await DB.update(
            'sites',
            {
                cid: cid,
            },
            { site_id: id }
        );

        // log.debug({c});
        // const fe = f.addAll(globSource('tmp/test', '**/*'));

        // for await (const file of fe) {
        //     log.debug({ file });
        // }

        response.send('Hello ' + auth.user_id + ' ' + cid);
        // response.send('hi');
    }
);

// DeploymentRouter.get(
//     '/create',
//     useYup(CreateQuery, (request) => request.query),
//     useKeyHost(GET)
// );
