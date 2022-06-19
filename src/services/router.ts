import { FastifyReply, FastifyRequest } from 'fastify';
import { log } from '../util/logging';

// import RE2 from 're2';
import { resolveRoute } from './resolver/RouteResolver';
// import { getConfig } from './deploymentConfig';
import { getSiteData } from './dlt';
import {
    getHeaderRules,
    getRedirectRules,
    getRewriteRules,
    matchRedirects,
    matchRewrites,
} from './hrr';
import { shouldSlashRedirect } from './routing/tailing_slash';
import { SignalStorage } from '../storage/SignalFS';
import { StorageBackend } from '..';
import { getDeploymentData } from './deployment';

export class SafeError extends Error {
    constructor(
        public status: number,
        public reply: string,
        public marker?: string
    ) {
        super(`---${status}-${reply}`);
    }
}

/**
 * List of shit to do
 * - DLT
 * - Get Domain Settings
 * - Find file to resolve
 * -
 */

/**
 * IN PARAELLELLlOGRAM, do ze following plz:
 * - check full-text-search 4 headers
 *   - if found, remember em 4 later
 * - check full-text-search 4 redirects
 *   - if found, abort all other, send 30X
 * - check full-text-search 4 rewrites
 *   - if found, or not found, load the path from deployment
 *      - traverse `storage-provider` (signalfs), to find file that matches and exists
 *        - send file to user
 */

/**
 * MANUALLY LOAD DA SHIT, FOR LOOP DA SHIT, FIND DHAT SHIT
 * in the meanwhile code a super efficient other docker microservice thingie boi in rust or go that goes brrrrr real faster then regex, yes, much wow
 */

export const routeGeneric = async (
    request: FastifyRequest,
    reply: FastifyReply
) => {
    // both urls subject to change
    const base_url = request.hostname; // example.com
    const path_url = request.url; // /foo
    const resolve_path = path_url;

    const siteData = await getSiteData(base_url);

    if (!siteData) {
        throw new SafeError(404, 'Not Found');
    }

    const { deploy_id, app_id } = siteData;

    // Parallel Requests to Figure out Rewrites/Redirects/Headers
    const [headers, redirects, rewrites] = await Promise.allSettled([
        getHeaderRules(deploy_id, path_url),
        getRedirectRules(deploy_id, path_url),
        getRewriteRules(deploy_id, path_url),
    ]);

    // log.debug({ headers, redirects, rewrites });

    // Check if we should redirect
    const shouldRedirectURL =
        redirects.status == 'fulfilled' &&
        redirects.value &&
        matchRedirects(redirects.value, path_url);

    // log.debug({ shouldRedirectURL });

    // If we should redirect, redirect, return
    if (shouldRedirectURL) {
        throw new SafeError(
            shouldRedirectURL.status,
            shouldRedirectURL.destination
        );
    }

    // Apply redirecting routing data (eg trailingSlash)
    // check if basepath ends with slashiething, do logic, redirect if needed
    const shouldSlashRedirects = shouldSlashRedirect();

    if (shouldSlashRedirects) {
        throw new SafeError(307, shouldSlashRedirects);
    }

    // If we should rewrite, alter path
    const shouldRewriteURL =
        rewrites.status == 'fulfilled' &&
        matchRewrites(rewrites.value, path_url);

    if (shouldRewriteURL) {
        resolve_path == shouldRewriteURL.destination;
    }

    // Get SID
    const sidData = await getDeploymentData(deploy_id);

    if (!sidData) throw new SafeError(404, 'Not Found', 'no-sid');

    // File traversal magic
    const fileData = await resolveRoute(
        StorageBackend,
        sidData.sid,
        resolve_path
    );

    if (!fileData) {
        throw new SafeError(404, 'Not Found', 'no-file-data');
    }

    // log.debug({ fileData });

    // Send file to user
    // reply.send(stream);

    try {
        reply.type(fileData.type);
        reply.send(fileData.stream);

        return;
    } catch {

    }

    reply.send(`Hello World: ${base_url}${resolve_path}`);

    // const config = await getConfig(deploy_id);

    // for (const headerSet of config.headers) {
    //     const re2 = new RE2(headerSet.source.replace('/', '\\/'));

    //     if (re2.test(request.url)) {
    //         for (const header of headerSet.headers) {
    //             reply.header(header.name, header.value);
    //         }
    //     }
    // }
    // throw new SafeError(401, 'Unauthorized', '');
};
