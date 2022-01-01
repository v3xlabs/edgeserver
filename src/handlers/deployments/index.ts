import { Router } from 'express';
import { AuthRequest, useAuth } from '../../auth/useAuth';
import { create, globSource } from 'ipfs-http-client';
import { ToDirectory, ToFile } from 'ipfs-core-types/src/utils';
import { log } from '../../util/logging';
import fileUpload, { FileArray, UploadedFile } from 'express-fileupload';
import { Extract } from 'unzipper';
import { createReadStream, rmSync } from 'node:fs';
import { useYup, UseYupRequest } from 'use-yup';
import * as yup from 'yup';
import { iterateDelay } from '../../util/IterativeDelay';
import { AddResult } from 'ipfs-core-types/src/root';
import { DB } from '../../Data';
import Long from 'long';
import { rm } from 'node:fs/promises';

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
            site_id: Long.fromString(id),
        });

        if (!site) return '';

        const files = request.files;

        if (!files) return '';
        if (!Object.keys(files).includes('data')) return '';

        const file = files['data'] as UploadedFile;
        log.debug({ file });

        const feee = createReadStream(file.tempFilePath);
        feee.pipe(Extract({ path: 'tmp/test' }));

        await new Promise<void>((accept) => {
            feee.on('close', accept);
        });

        rmSync(file.tempFilePath);

        const f = create({
            url: process.env.IPFS_API || 'http://localhost:5001',
        });

        const handPath = 'sites/' + site.site_id;

        try {
            await f.files.rm('/' + handPath, { recursive: true });
        } catch {
            log.debug();
        }

        await new Promise<void>((accept) => setTimeout(accept, 1000));

        let out: AddResult;
        for await (const file of await f.addAll(
            iterateDelay('/' + handPath, globSource('tmp/test', '**/*'))
        )) {
            log.debug(file);
            if (file.path === handPath) {
                out = file;
            }
        }

        try {
            await rm('tmp/test', { recursive: true });
        } catch {
            log.debug('Failed to delete folder');
        }

        await DB.update('sites', {
            cid: out.cid.toString(),
        }, { site_id: Long.fromString(id) });

        // log.debug({c});
        // const fe = f.addAll(globSource('tmp/test', '**/*'));

        // for await (const file of fe) {
        //     log.debug({ file });
        // }

        response.send('Hello ' + request.auth.user_id + ' ' + out.cid);
        // response.send('hi');
    }
);

// DeploymentRouter.get(
//     '/create',
//     useYup(CreateQuery, (request) => request.query),
//     useKeyHost(GET)
// );
