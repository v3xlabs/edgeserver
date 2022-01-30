import { Logger } from '@lvksh/logger';
import { FastifyInstance, FastifyLoggerInstance } from 'fastify';

/**
 * Setup logging with fastify and @lvksh/logger
 * @param server Fastify Instance
 * @param logger Logger Instance
 */
export const setupLogger = (
    server: FastifyInstance,
    logger: Logger<string>
) => {
    const old = server.log;

    server.log = {
        info: logger.network,
        error: logger.network,
        debug: logger.network,
        fatal: logger.network,
        warn: logger.network,
        trace: logger.network,
        child: (): FastifyLoggerInstance => old,
    } as FastifyLoggerInstance;
};
