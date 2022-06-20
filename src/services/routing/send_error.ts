import chalk from 'chalk';
import { FastifyReply } from 'fastify';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { SafeError } from '../../util/error/SafeError';
import { log } from '../../util/logging';

const codesToStatic = new Set([404, 502]);

export const sendError = (
    error: SafeError | Error,
    reply: FastifyReply,
    url: string
) => {
    if (!(error instanceof SafeError)) {
        log.error(`REQ ${url}`, error);

        reply.status(502).send();
        log.debug(`502 ${url}`);

        return;
    }

    if (error.status >= 300 && error.status <= 399) {
        reply.code(error.status).redirect(error.reply);
        log.debug(
            `REQ ${url}`,
            chalk.cyan(`${error.status} -> ${error.reply}`)
        );

        return;
    }

    if (codesToStatic.has(error.status)) {
        sendErrorPage(reply, error.status);
        log.debug(`${error.status} ${url}`);

        return;
    }

    log.debug(`REQ ${url}`, `http aborted with ${error.status}`);
    reply.status(error.status).send(error.reply);
};

export const sendErrorPage = (reply: FastifyReply, status: number) => {
    reply.type('text/html');
    reply.status(status);

    const buffer = readFileSync(join(__dirname, `../../static/${status}.html`));

    reply.send(buffer);
};
